import {
   BadRequestException,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common'
import { SignInDto } from './dto/sign.in.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as speakeasy from 'speakeasy'
import { SmsService } from 'src/sms/sms.service'
import { RedisService } from 'src/redis/redis.service'
import { ConfigService } from '@nestjs/config'
import { AUTH_SIGN_IN_PREFIX } from 'constants/redis.constant'
import { UserRole } from 'enums/profile.enum'

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
         if (
            signInDto.role !== UserRole.ADMIN &&
            existingUser.role !== signInDto.role
         ) {
            throw new UnauthorizedException(`User role doesn't match`)
         }
         if (!Object.values(UserRole).includes(signInDto.role)) {
            throw new UnauthorizedException('User role not allowed')
         }

         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })

         let message: string = ''

         if (signInDto.locale === 'fr') {
            message = ` Votre code OTP pour la connexion est : ${confirmationCode}`
         } else if (signInDto.locale === 'mg') {
            message = ` Indro ny kaody OTP afahanao miditra : ${confirmationCode}`
         } else if (signInDto.locale === 'en') {
            message = `Your OTP code for sign in is : ${confirmationCode}`
         } else if (signInDto.locale === 'zh') {
            message = `您的登录 OTP 验证码是 : ${confirmationCode}`
         }

         await this.smsService.sendSMS([signInDto.phoneNumber], message)
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
