import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { UserRole } from 'enums/profile.enum'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { SmsService } from 'src/sms/sms.service'
import * as speakeasy from 'speakeasy'
import { GenderType } from '@prisma/client'
import { DeleteProfileDto } from './dto/delete.profile.dto'
import { DELETE_PROFILE_PREFIX } from 'constants/redis.constant'
import { EVENT_DELETEE_PROFILE } from 'constants/event.constant'
import { ConfirmDeleteProfileDto } from './dto/confirm.delete.profile.dto'

@Injectable()
export class DeleteProfileService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly gateWay: Gateway,
      private readonly redisService: RedisService,
   ) {}

   async deleteProfileByAdmin(sub: string) {
      try {
         await this.prismaService.profile.delete({
            where: {
               sub,
               role: { in: [UserRole.CLIENT, UserRole.DRIVER] },
            },
         })
      } catch (error) {
         throw error
      }
   }

   async deleteProfile(phoneNumber: string) {
      try {
         const profile = await this.prismaService.profile.findUnique({
            where: { phoneNumber, role: UserRole.CLIENT },
            select: {
               sub: true,
               firstName: true,
               lastName: true,
               gender: true,
               profilePhoto: true,
               clientProfile: {
                  select: {
                     rapideWallet: {
                        select: {
                           rapideWalletId: true,
                           balance: true,
                           status: true,
                        },
                     },
                  },
               },
            },
         })
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         await this.smsService.sendSMS(
            [phoneNumber],
            `Dear ${profile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${profile.lastName} ${profile.firstName}, please enter the code ${confirmationCode} to confirm your account deletion.`,
         )
         const data: DeleteProfileDto = {
            attempt: 3,
            code: confirmationCode,
            isProfileVerified: false,
            firstName: profile.firstName,
            lastName: profile.lastName,
            gender: profile.gender,
            rapideWalletId: profile.clientProfile.rapideWallet.rapideWalletId,
            sub: profile.sub,
            balance: profile.clientProfile.rapideWallet.balance,
            rapideWalletStatus: profile.clientProfile.rapideWallet.status,
            profilePhoto: profile.profilePhoto,
            phoneNumber,
         }
         await this.redisService.set(
            `${DELETE_PROFILE_PREFIX}-${profile.sub}`,
            JSON.stringify(data),
            30 * 60,
         )
         return { profileId: profile.sub }
      } catch (error) {
         throw error
      }
   }

   async confirmDeleteInformation(confirmDeleteDto: ConfirmDeleteProfileDto) {
      try {
         const data: DeleteProfileDto = JSON.parse(
            await this.redisService.get(
               `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
            ),
         )
         if (!data) {
            throw new NotFoundException(`Profile not found`)
         }
         if (data.code !== confirmDeleteDto.code) {
            if (data.attempt > 1) {
               data.attempt--
               const ttl = await this.redisService.ttl(
                  `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
               )
               await this.redisService.set(
                  `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
                  JSON.stringify(data),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${data.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }
         data.isProfileVerified = true
         const ttl = await this.redisService.ttl(
            `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
         )
         await this.redisService.set(
            `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
            JSON.stringify(data),
            ttl,
         )
         return {
            firstName: data.firstName,
            lastName: data.lastName,
            profilePhoto: data.profilePhoto,
            gender: data.gender,
            balance: data.balance,
            rapideWalletStatus: data.rapideWalletStatus,
         }
      } catch (error) {
         throw error
      }
   }

   async sendConfirmationCodeForDelete(profileId: string) {
      try {
         const data: DeleteProfileDto = JSON.parse(
            await this.redisService.get(
               `${DELETE_PROFILE_PREFIX}-${profileId}`,
            ),
         )
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         const ttl = await this.redisService.ttl(
            `${DELETE_PROFILE_PREFIX}-${profileId}`,
         )
         data.code = confirmationCode
         await this.redisService.set(
            `${DELETE_PROFILE_PREFIX}-${profileId}`,
            JSON.stringify(data),
            ttl,
         )
         await this.smsService.sendSMS(
            [data.phoneNumber],
            `Dear ${data.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${data.lastName} ${data.firstName}, please enter the code ${confirmationCode} to confirm your account deletion.`,
         )
      } catch (error) {
         throw error
      }
   }

   async confirmDeleteProfile(confirmDeleteDto: ConfirmDeleteProfileDto) {
      try {
         const data = JSON.parse(
            await this.redisService.get(
               `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
            ),
         )
         if (!data) {
            throw new NotFoundException(`Profile not found`)
         }
         if (data.code !== confirmDeleteDto.code) {
            if (data.attempt > 1) {
               data.attempt--
               const ttl = await this.redisService.ttl(
                  `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
               )
               await this.redisService.set(
                  `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
                  JSON.stringify(data),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${data.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }
         if (!data.isProfileVerified) {
            throw new BadRequestException(
               'Please confirm your account your identitie before deleting your account.',
            )
         }
         await this.prismaService.profile.delete({
            where: { sub: confirmDeleteDto.profileId },
            select: {
               firstName: true,
               lastName: true,
               profilePhoto: true,
               gender: true,
            },
         })
         await this.prismaService.rapideWallet.delete({
            where: { rapideWalletId: data.rapideWalletId },
         })
         await this.redisService.remove(
            `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
         )
         await this.gateWay.sendNotificationToAdmin(EVENT_DELETEE_PROFILE, {
            firstName: data.firstName,
            lastName: data.lastName,
            profilePhoto: data.profilePhoto,
            gender: data.gender,
            phoneNumber: data.phoneNumber,
         })
         await this.redisService.remove(
            `${DELETE_PROFILE_PREFIX}-${confirmDeleteDto.profileId}`,
         )
      } catch (error) {
         throw error
      }
   }

   async resendCode(profileId: string) {
      this.sendConfirmationCodeForDelete(profileId)
   }
}
