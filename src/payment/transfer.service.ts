import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { InitTransferDto } from './dto/initTransfer.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import { SmsService } from 'src/sms/sms.service'
import {
   GenderType,
   MethodType,
   RapideWalletStatus,
   TransactionStatus,
   TransactionType,
} from '@prisma/client'
import { RedisService } from 'src/redis/redis.service'
import { TRANSFER_VALIDATION } from 'constants/redis.constant'
import { Gateway } from 'src/gateway/gateway'
import { EVENT_TRANSFER } from 'constants/event.constant'
import { TransferRedisDataInterface } from 'interfaces/transfer.redis.data.interface'
import { connect } from 'http2'

@Injectable()
export class TransferService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly redisService: RedisService,
      private readonly gateway: Gateway,
   ) {}

   async startTransfer(initTransferDto: InitTransferDto) {
      try {
         const transaction = await this.prismaService.$transaction(
            async (prisma) => {
               const senderClientProfile = await prisma.profile.findUnique({
                  where: { phoneNumber: initTransferDto.fromPhoneNumber },
                  select: {
                     sub: true,
                     phoneNumber: true,
                     firstName: true,
                     lastName: true,
                     gender: true,
                     clientProfile: {
                        select: {
                           rapideWallet: {
                              select: {
                                 balance: true,
                                 password: true,
                                 status: true,
                              },
                           },
                        },
                     },
                  },
               })
               if (
                  senderClientProfile.clientProfile.rapideWallet.status ===
                  RapideWalletStatus.PENDING
               ) {
                  throw new BadRequestException("You don't have a wallet")
               }
               const isMatch = await bcrypt.compare(
                  initTransferDto.walletPassword,
                  senderClientProfile.clientProfile.rapideWallet.password,
               )
               if (!isMatch) {
                  throw new BadRequestException('Incorrect password')
               }
               if (!senderClientProfile) {
                  throw new NotFoundException('Client sender not found')
               }
               if (
                  senderClientProfile.clientProfile.rapideWallet.balance <
                  initTransferDto.amount
               ) {
                  throw new BadRequestException(
                     'You do not have enough funds to make this transfer.',
                  )
               }
               const reseiverClientProfile = await prisma.profile.findUnique({
                  where: { phoneNumber: initTransferDto.toPhoneNumber },
                  select: {
                     sub: true,
                     lastName: true,
                     firstName: true,
                     profilePhoto: true,
                  },
               })
               if (!reseiverClientProfile.sub) {
                  throw new NotFoundException(
                     "The user that you try to send money doesn't is not found",
                  )
               }
               const secret = speakeasy.generateSecret({ length: 20 })
               const confirmationCode = speakeasy.totp({
                  secret: secret.base32,
                  encoding: 'base32',
               })
               const transferRedisData: TransferRedisDataInterface = {
                  from: senderClientProfile.sub,
                  to: reseiverClientProfile.sub,
                  amount: initTransferDto.amount,
                  code: confirmationCode,
                  attempt: 3,
               }
               await this.redisService.set(
                  `${TRANSFER_VALIDATION}-${senderClientProfile.sub}`,
                  JSON.stringify(transferRedisData),
                  10 * 60,
               )
               await this.smsService.sendSMS(
                  [senderClientProfile.phoneNumber],
                  `Your transaction code is : ${confirmationCode}`,
               )
               return {
                  reseiverId: reseiverClientProfile.sub,
                  firstName: reseiverClientProfile.firstName,
                  lastName: reseiverClientProfile.lastName,
                  profilePhoto: reseiverClientProfile.profilePhoto,
                  amount: initTransferDto.amount,
               }
            },
         )
         return transaction
      } catch (error) {
         throw error
      }
   }

   async confirmTransfer(clientProfileId: string, code: string) {
      try {
         const transferInfo: TransferRedisDataInterface = JSON.parse(
            await this.redisService.get(
               `${TRANSFER_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!transferInfo) {
            throw new NotFoundException('Transfer information not found')
         }
         if (transferInfo.code !== code) {
            if (transferInfo.attempt > 1) {
               transferInfo.attempt--
               const ttl = await this.redisService.ttl(
                  `${TRANSFER_VALIDATION}-${clientProfileId}`,
               )
               await this.redisService.set(
                  `${TRANSFER_VALIDATION}-${clientProfileId}`,
                  JSON.stringify(transferInfo),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${transferInfo.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${TRANSFER_VALIDATION}-${clientProfileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }
         const transactionData = await this.prismaService.$transaction(
            async (prisma) => {
               const senderRapideWallet = await prisma.rapideWallet.update({
                  where: {
                     clientProfileId: transferInfo.from,
                     balance: { gt: transferInfo.amount },
                  },
                  data: {
                     balance: { decrement: transferInfo.amount },
                     transferCount: { increment: 1 },
                     transactionCount: { increment: 1 },
                     successCount: { increment: 1 },
                  },
                  select: {
                     balance: true,
                     clientProfile: {
                        select: {
                           profile: {
                              select: {
                                 firstName: true,
                                 lastName: true,
                                 phoneNumber: true,
                                 gender: true,
                                 sub: true,
                              },
                           },
                        },
                     },
                  },
               })
               const reseiverRapideWallet = await prisma.rapideWallet.update({
                  where: { clientProfileId: transferInfo.to },
                  data: {
                     balance: { increment: transferInfo.amount },
                     transactionCount: { increment: 1 },
                     transferCount: { increment: 1 },
                     successCount: { increment: 1 },
                  },
                  select: {
                     balance: true,
                     clientProfile: {
                        select: {
                           profile: {
                              select: {
                                 firstName: true,
                                 lastName: true,
                                 phoneNumber: true,
                                 gender: true,
                                 sub: true,
                              },
                           },
                        },
                     },
                  },
               })
               const transaction = await prisma.transaction.create({
                  data: {
                     amount: transferInfo.amount,
                     from: transferInfo.from,
                     to: transferInfo.to,
                     clientProfiles: {
                        connect: [
                           { clientProfileId: transferInfo.from },
                           { clientProfileId: transferInfo.to },
                        ],
                     },
                     method: MethodType.RAPIDE_WALLET,
                     status: TransactionStatus.SUCCESS,
                     type: TransactionType.TRANSFER,
                     fees: 0,
                     description: 'Transfer with rapide wallet.',
                  },
               })
               const reseiverProfile =
                  reseiverRapideWallet.clientProfile.profile
               const senderProfile = senderRapideWallet.clientProfile.profile
               await this.gateway.sendNotificationToClient(
                  reseiverProfile.sub,
                  EVENT_TRANSFER,
                  { balance: reseiverRapideWallet.balance },
               )
               await this.gateway.sendNotificationToClient(
                  senderProfile.sub,
                  EVENT_TRANSFER,
                  { balance: senderRapideWallet.balance },
               )
               await this.smsService.sendSMS(
                  [reseiverProfile.phoneNumber],
                  `Dear ${reseiverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${reseiverProfile.lastName} ${reseiverProfile.firstName}, your reseave ${transferInfo.amount} Ar from ${senderProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${senderProfile.lastName} ${senderProfile.firstName}. The transaction reference is ${transaction.reference.toString().padStart(6, '0')}`,
               )
               await this.redisService.remove(
                  `${TRANSFER_VALIDATION}-${clientProfileId}`,
               )
               return {
                  senderRapideWallet,
                  transaction,
               }
            },
         )
         return transactionData
      } catch (error) {
         throw error
      }
   }

   async resendCode(clientProfileId: string) {
      try {
         const transferInfo: TransferRedisDataInterface = JSON.parse(
            await this.redisService.get(
               `${TRANSFER_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!transferInfo) {
            throw new NotFoundException('transfer information not found')
         }
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         transferInfo.code = confirmationCode
         const ttl = await this.redisService.ttl(
            `${TRANSFER_VALIDATION}-${clientProfileId}`,
         )
         await this.redisService.set(
            `${TRANSFER_VALIDATION}-${clientProfileId}`,
            JSON.stringify(transferInfo),
            ttl,
         )
         const senderClientProfile =
            await this.prismaService.profile.findUnique({
               where: { sub: clientProfileId },
               select: {
                  phoneNumber: true,
                  firstName: true,
                  lastName: true,
                  gender: true,
               },
            })
         await this.smsService.sendSMS(
            [senderClientProfile.phoneNumber],
            `Your transaction code is : ${transferInfo.code}`,
         )
      } catch (error) {
         throw error
      }
   }
}
