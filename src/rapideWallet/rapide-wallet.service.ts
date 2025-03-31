import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SetRapideWalletInformationDto } from './dto/set-rapide-wallet-information.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import * as jwt from 'jsonwebtoken'
import { GenderType, RapideWalletStatus, UserRole } from '@prisma/client'
import { RedisService } from 'src/redis/redis.service'
import { SmsService } from 'src/sms/sms.service'
import { RAPIDE_WALLET_VALIDATION } from 'constants/redis.constant'
import { RapideWalletInformationValidationInterface } from 'interfaces/rapide.wallet.interface'
import { ConfigService } from '@nestjs/config' 
import {
   SPECIAL_ACCESS_OTP,
   SPECIAL_ACCESS_PHONE_NUMBER,
} from 'constants/access.constant'
import { ResendConfirmationCodeRapideWalletInformationDto } from './dto/resend-confirmation-code-rapide-wallet-information.dto'

@Injectable()
export class RapideWalletService {
   private JWT_SECRET_CLIENT = ''
   private JWT_SECRET_DRIVER = ''
   private JWT_EXPIRES_IN = ''
   constructor(
      private readonly prismaService: PrismaService,
      private readonly redisService: RedisService,
      private readonly smsService: SmsService,
      private readonly configService: ConfigService,
   ) {
      this.JWT_SECRET_CLIENT =
         this.configService.get<string>('JWT_SECRET_CLIENT')
      this.JWT_SECRET_DRIVER =
         this.configService.get<string>('JWT_SECRET_DRIVER')
      this.JWT_EXPIRES_IN = this.configService.get<string>('JWT_EXPIRES_IN')
   }

   async setRapideWalletInformation(

      profileId: string,
      setRapideWalletInformationDto: SetRapideWalletInformationDto,
   ) {
      try {
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode =
            setRapideWalletInformationDto.phoneNumber ===
            SPECIAL_ACCESS_PHONE_NUMBER
               ? SPECIAL_ACCESS_OTP
               : speakeasy.totp({
                    secret: secret.base32,
                    encoding: 'base32',
                 })

         let message: string = ''

         if (setRapideWalletInformationDto.locale === 'fr') {
            message = ` Votre code OTP pour la validation est : ${confirmationCode}`
         } else if (setRapideWalletInformationDto.locale === 'mg') {
            message = ` Indro ny kaody OTP afahanao manamarina : ${confirmationCode}`
         } else if (setRapideWalletInformationDto.locale === 'en') {
            message = `Your OTP code for validation is : ${confirmationCode}`
         } else if (setRapideWalletInformationDto.locale === 'zh') {
            message = `您的 OTP 验证码 : ${confirmationCode}`
         }

         if (
            setRapideWalletInformationDto.phoneNumber !==
            SPECIAL_ACCESS_PHONE_NUMBER
         )
            await this.smsService.sendSMS(
               [setRapideWalletInformationDto.phoneNumber],
               message,
            )

         const dataOnRedis: RapideWalletInformationValidationInterface = {
            ...setRapideWalletInformationDto,
            confirmationCode,
            attempt: 3,
         }
         await this.redisService.set(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
            JSON.stringify(dataOnRedis),
            10 * 60,
         )
      } catch (error) {
         throw error
      }
   }

   async validateRapideWalletInformation(
      profileId: string,
      phoneNumber: string,
      confirmationCode: string,
      userRole: UserRole,
   ) {
      try {
         const rapideWalletInformationString: string =
            await this.redisService.get(
               `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
            )
         if (!rapideWalletInformationString) {
            throw new NotFoundException('Timeout expired')
         }
         const rapideWalletInformation: RapideWalletInformationValidationInterface =
            JSON.parse(rapideWalletInformationString)

         if (confirmationCode !== rapideWalletInformation.confirmationCode) {
            if (rapideWalletInformation.attempt > 1) {
               rapideWalletInformation.attempt--
               const ttl = await this.redisService.ttl(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
               )
               await this.redisService.set(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
                  JSON.stringify(rapideWalletInformation),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${rapideWalletInformation.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }

         const salt = await bcrypt.genSalt(10, 'a')
         const hashedPassword = await bcrypt.hash(
            rapideWalletInformation.password,
            salt,
         )
         const condition =
            userRole === UserRole.CLIENT
               ? { clientProfileId: profileId }
               : { driverProfileId: profileId }

         const rapideWallet = await this.prismaService.rapideWallet.update({
            where: condition,
            data: {
               idCard: rapideWalletInformation.idCard,
               idCardPhotoRecto: rapideWalletInformation.idCardPhotoRecto,
               idCardPhotoVerso: rapideWalletInformation.idCardPhotoVerso,
               password: hashedPassword,
               status:
                  phoneNumber === SPECIAL_ACCESS_PHONE_NUMBER
                     ? RapideWalletStatus.ACTIVE
                     : RapideWalletStatus.PENDING,
            },
            select: {
               driverProfile: {
                  select: {
                     status: true,
                  },
               },
               clientProfile: {
                  select: {
                     status: true,
                  },
               },
               status: true,
            },
         })

         await this.redisService.remove(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
         )

         const updateUserProfile = {
            sub: profileId,
            role: userRole,
            status:
               userRole === UserRole.CLIENT
                  ? rapideWallet.clientProfile.status
                  : rapideWallet.driverProfile.status,
            rapideWalletStatus: rapideWallet.status,
         }
         const token = jwt.sign(
            updateUserProfile,
            userRole === UserRole.CLIENT
               ? this.JWT_SECRET_CLIENT
               : this.JWT_SECRET_DRIVER,
            {
               expiresIn: this.JWT_EXPIRES_IN,
            },
         )
         return { token }
      } catch (error) {
         throw error
      }
   }

   async resendCode(
      profileId: string,
      resendConfirmationCodeRapideWalletInformationDto: ResendConfirmationCodeRapideWalletInformationDto,
   ) {
      try {
         const rapideWalletInformationString: string =
            await this.redisService.get(
               `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
            )
         if (!rapideWalletInformationString) {
            throw new NotFoundException('Timeout expired')
         }
         const rapideWalletInformation: RapideWalletInformationValidationInterface =
            JSON.parse(rapideWalletInformationString)

         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode =
            resendConfirmationCodeRapideWalletInformationDto.phoneNumber ===
            SPECIAL_ACCESS_PHONE_NUMBER
               ? SPECIAL_ACCESS_OTP
               : speakeasy.totp({
                    secret: secret.base32,
                    encoding: 'base32',
                 })

         let message: string = ''

         if (resendConfirmationCodeRapideWalletInformationDto.locale === 'fr') {
            message = ` Votre code OTP pour la validation est : ${confirmationCode}`
         } else if (
            resendConfirmationCodeRapideWalletInformationDto.locale === 'mg'
         ) {
            message = ` Indro ny kaody OTP afahanao manamarina : ${confirmationCode}`
         } else if (
            resendConfirmationCodeRapideWalletInformationDto.locale === 'en'
         ) {
            message = `Your OTP code for validation is : ${confirmationCode}`
         } else if (
            resendConfirmationCodeRapideWalletInformationDto.locale === 'zh'
         ) {
            message = `您的 OTP 验证码 : ${confirmationCode}`
         }

         if (
            resendConfirmationCodeRapideWalletInformationDto.phoneNumber !==
            SPECIAL_ACCESS_PHONE_NUMBER
         )
            await this.smsService.sendSMS(
               [resendConfirmationCodeRapideWalletInformationDto.phoneNumber],
               message,
            )

         rapideWalletInformation.confirmationCode = confirmationCode
         const ttl = await this.redisService.ttl(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
         )
         await this.redisService.set(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
            JSON.stringify(rapideWalletInformation),
            ttl,
         )
      } catch (error) {
         throw error
      }
   }

   async updateStatus(rapideWalletId: string, status: RapideWalletStatus) {
      try {
         const rapideWallet = await this.prismaService.rapideWallet.update({
            where: { rapideWalletId },
            data: { status },
            select: {
               clientProfile: {
                  select: {
                     profile: {
                        select: {
                           phoneNumber: true,
                           gender: true,
                           firstName: true,
                           lastName: true,
                        },
                     },
                  },
               },
               driverProfile: {
                  select: {
                     profile: {
                        select: {
                           phoneNumber: true,
                           gender: true,
                           firstName: true,
                           lastName: true,
                        },
                     },
                  },
               },
            },
         })
         if (status === RapideWalletStatus.ACTIVE) {
            console.log('sms sended')
            const customerProfile = rapideWallet.clientProfile
               ? rapideWallet.clientProfile.profile
               : rapideWallet.driverProfile.profile

            await this.smsService.sendSMS(
               [customerProfile.phoneNumber],
               `Dear ${customerProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${customerProfile.firstName} ${customerProfile.lastName}, your Rapide Wallet is now active!`,
            )
         }
         return rapideWallet
      } catch (error) {
         throw error
      }
   }

   async getRapideWallet(profileId: string, userRole: UserRole) {
      try {
         const condition =
            userRole === UserRole.CLIENT
               ? { clientProfileId: profileId }
               : { driverProfileId: profileId }
         return await this.prismaService.rapideWallet.findUnique({
            where: condition,
            omit: {
               password: true,
               idCardPhotoRecto: true,
               idCardPhotoVerso: true,
            },
         })
      } catch (error) {
         throw error
      }
   }
}
