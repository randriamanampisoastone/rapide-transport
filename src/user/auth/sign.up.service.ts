import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common'
import { SignUpDto } from './dto/sign.up.dto'
import * as speakeasy from 'speakeasy'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_UP_PREFIX } from 'constants/redis.constant'
import { ConfigService } from '@nestjs/config'
import { SmsService } from 'src/sms/sms.service'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SignUpService implements OnModuleInit {
   private AUTH_OTP_TTL = 0
   constructor(
      private readonly redisService: RedisService,
      private readonly configService: ConfigService,
      private readonly smsService: SmsService,
      private readonly prismaService: PrismaService,
   ) {}

   onModuleInit() {
      this.AUTH_OTP_TTL = this.configService.get<number>('AUTH_OTP_TTL')
   }

   async signUp(signUpDto: SignUpDto) {
      try {
         const existingUser = await this.prismaService.profile.findFirst({
            where: {
               OR: [
                  { email: signUpDto.email },
                  { phoneNumber: signUpDto.phoneNumber },
               ],
            },
         })

         if (existingUser) {
            throw new BadRequestException(
               'User with this phone number already exists',
            )
         }

         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })

         let message: string = ''

         if (signUpDto.locale === 'fr') {
            message = ` Votre code OTP pour la connexion est : ${confirmationCode}`
         } else if (signUpDto.locale === 'mg') {
            message = ` Indro ny kaody OTP afahanao miditra : ${confirmationCode}`
         } else if (signUpDto.locale === 'en') {
            message = `Your OTP code for sign in is : ${confirmationCode}`
         } else if (signUpDto.locale === 'zh') {
            message = `您的登录 OTP 验证码是 : ${confirmationCode}`
         }

         await this.smsService.sendSMS([signUpDto.phoneNumber], message)

         const updateSignUpDto = {
            attempt: 0,
            confirmationCode,
            ...signUpDto,
         }
         await this.redisService.set(
            `${AUTH_SIGN_UP_PREFIX + signUpDto.phoneNumber}`,
            JSON.stringify(updateSignUpDto),
            this.AUTH_OTP_TTL,
         )
      } catch (error) {
         console.error(error)
         throw error
      }
   }
}
