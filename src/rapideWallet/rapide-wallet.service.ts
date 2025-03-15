import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SetRapideWalletInfoDto } from './dto/set-rapide-wallet-info.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import { GenderType, RapideWalletStatus, UserRole } from '@prisma/client'
import { RedisService } from 'src/redis/redis.service'
import { SmsService } from 'src/sms/sms.service'
import { RAPIDE_WALLET_VALIDATION } from 'constants/redis.constant'
import { SetRapideWalletInfoValidationInterface } from 'interfaces/set.rapide.wallet.info.validation.interface'

@Injectable()
export class RapideWalletService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly redisService: RedisService,
      private readonly smsService: SmsService,
   ) {}

   async setInformation(
      profileId: string,
      setRapideWalletInfoDto: SetRapideWalletInfoDto,
   ) {
      try {
         const userProfile = await this.prismaService.profile.findUnique({
            where: { sub: profileId },
            select: {
               gender: true,
               phoneNumber: true,
               firstName: true,
               lastName: true,
            },
         })
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         const dataOnRedis: SetRapideWalletInfoValidationInterface = {
            ...setRapideWalletInfoDto,
            code: confirmationCode,
            attempt: 3,
         }
         await this.redisService.set(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
            JSON.stringify(dataOnRedis),
            10 * 60,
         )
         await this.smsService.sendSMS(
            [userProfile.phoneNumber],
            `Dear ${userProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${userProfile.lastName} ${userProfile.firstName}, your validation code is : ${confirmationCode}`,
         )
      } catch (error) {
         throw error
      }
   }

   async validateInformation(
      profileId: string,
      code: string,
      userRole: UserRole,
   ) {
      try {
         const rapideWalletInfo: SetRapideWalletInfoValidationInterface =
            JSON.parse(
               await this.redisService.get(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
               ),
            )

         if (code !== rapideWalletInfo.code) {
            if (rapideWalletInfo.attempt > 1) {
               rapideWalletInfo.attempt--
               const ttl = await this.redisService.ttl(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
               )
               await this.redisService.set(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
                  JSON.stringify(rapideWalletInfo),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${rapideWalletInfo.attempt} attempt left.`,
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
            rapideWalletInfo.password,
            salt,
         )
         const condition =
            userRole === UserRole.CLIENT
               ? { clientProfileId: profileId }
               : { driverProfileId: profileId }
         await this.prismaService.rapideWallet.update({
            where: condition,
            data: {
               idCard: rapideWalletInfo.idCard,
               idCardPhotoRecto: rapideWalletInfo.idCardPhotoRecto,
               idCardPhotoVerso: rapideWalletInfo.idCardPhotoVerso,
               password: hashedPassword,
            },
         })
         await this.redisService.remove(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
         )
      } catch (error) {
         throw error
      }
   }

   async resendCode(profileId: string) {
      try {
         const rapideWalletInfo: SetRapideWalletInfoValidationInterface =
            JSON.parse(
               await this.redisService.get(
                  `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
               ),
            )
         if (!rapideWalletInfo) {
            throw new NotFoundException('Timeout expired')
         }
         const profile = await this.prismaService.profile.findUnique({
            where: { sub: profileId },
            select: {
               gender: true,
               phoneNumber: true,
               firstName: true,
               lastName: true,
            },
         })
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         rapideWalletInfo.code = confirmationCode
         const ttl = await this.redisService.ttl(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
         )
         await this.redisService.set(
            `${RAPIDE_WALLET_VALIDATION}-${profileId}`,
            JSON.stringify(rapideWalletInfo),
            ttl,
         )
         await this.smsService.sendSMS(
            [profile.phoneNumber],
            `Dear ${profile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${profile.lastName} ${profile.firstName}, your validation code is : ${confirmationCode}`,
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
         })
         return rapideWallet
      } catch (error) {
         throw error
      }
   }
}
