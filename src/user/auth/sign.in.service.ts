import { BadRequestException, Injectable } from '@nestjs/common'
import { SignInDto } from './dto/sign.in.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as speakeasy from 'speakeasy'
import { SmsService } from 'src/sms/sms.service'
import { RedisService } from 'src/redis/redis.service'
import { ConfigService } from '@nestjs/config'
import { AUTH_SIGN_IN_PREFIX } from 'constants/redis.constant'

@Injectable()
export class SignInService {
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

   async signIn(signInDto: SignInDto) {
      try {
         const existingUser = await this.prismaService.profile.findUnique({
            where: { phoneNumber: signInDto.phoneNumber },
         })

         if (!existingUser) {
            throw new BadRequestException(
               `User with this phone number doesn't exists`,
            )
         }

         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })

         // await this.smsService.sendSMS(
         //    [signInDto.phoneNumber],
         //    `Your Rapide App OTP Code is : ${confirmationCode}`,
         // )
         const updateSignInDto = {
            attempt: 0,
            confirmationCode,
            ...signInDto,
         }
         await this.redisService.set(
            `${AUTH_SIGN_IN_PREFIX + signInDto.phoneNumber}`,
            JSON.stringify(updateSignInDto),
            this.AUTH_OTP_TTL,
         )
      } catch (error) {
         throw error
      }
   }
}
