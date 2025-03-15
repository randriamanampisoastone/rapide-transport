import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SetRapideWalletInfoDto } from './dto/set-rapide-wallet-info.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import * as jwt from 'jsonwebtoken'
import { GenderType, RapideWalletStatus, UserRole } from '@prisma/client'
import { RedisService } from 'src/redis/redis.service'
import { SmsService } from 'src/sms/sms.service'
import { RAPIDE_WALLET_VALIDATION } from 'constants/redis.constant'
import { SetRapideWalletInfoValidationInterface } from 'interfaces/set.rapide.wallet.info.validation.interface'
import { ConfigService } from '@nestjs/config'

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
         const rapideWallet = await this.prismaService.rapideWallet.update({
            where: condition,
            data: {
               idCard: rapideWalletInfo.idCard,
               idCardPhotoRecto: rapideWalletInfo.idCardPhotoRecto,
               idCardPhotoVerso: rapideWalletInfo.idCardPhotoVerso,
               password: hashedPassword,
               status: RapideWalletStatus.PENDING,
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

   async getRapideWallet(profileId: string, userRole: UserRole) {
      try {
         const condition =
            userRole === UserRole.CLIENT
               ? { clientProfileId: profileId }
               : { driverProfileId: profileId }
         return await this.prismaService.rapideWallet.findUnique({
            where: condition,
         })
      } catch (error) {
         throw error
      }
   }
}
