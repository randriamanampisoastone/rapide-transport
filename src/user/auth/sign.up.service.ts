import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common'
import { SignUpDto } from './dto/sign.up.dto'
import * as speakeasy from 'speakeasy'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_UP_PREFIX } from 'constants/redis.constant'
import { ConfigService } from '@nestjs/config'
import { SmsService } from 'src/sms/sms.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { SPECIAL_ACCESS_PHONE_NUMBER } from 'constants/access.constant'
import { SignUpDataOnRedisInterface } from 'interfaces/sign.up.data.on.redis.interface'

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
         const confirmationCode =
            signUpDto.phoneNumber === SPECIAL_ACCESS_PHONE_NUMBER
               ? '124578'
               : speakeasy.totp({
                    secret: secret.base32,
                    encoding: 'base32',
                 })

         let message: string = ''

         if (signUpDto.locale === 'fr') {
            message = ` Votre code OTP pour la création de compte est : ${confirmationCode}`
         } else if (signUpDto.locale === 'mg') {
            message = ` Indro ny kaody OTP afahanao misoratra anarana : ${confirmationCode}`
         } else if (signUpDto.locale === 'en') {
            message = `Your OTP code for sign up is : ${confirmationCode}`
         } else if (signUpDto.locale === 'zh') {
            message = `您的 OTP 验证码 : ${confirmationCode}`
         }

         if (signUpDto.phoneNumber !== SPECIAL_ACCESS_PHONE_NUMBER)
            await this.smsService.sendSMS([signUpDto.phoneNumber], message)

         const updateSignUpDto: SignUpDataOnRedisInterface = {
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
