import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { InitTransfertDto } from './dto/initTransfert.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import { SmsService } from 'src/sms/sms.service'
import {
   GenderType,
   PaymentMethodType,
   PaymentTransactionStatus,
   PaymentTransactionType,
} from '@prisma/client'
import { RedisService } from 'src/redis/redis.service'
import { TRANSFERT_VALIDATION } from 'constants/redis.constant'
import { TransfertRedisDataInterface } from 'interfaces/transfert.redis.data.interface'
import { attempt } from 'joi'
import { Gateway } from 'src/gateway/gateway'
import { EVENT_TRANSFERT } from 'constants/event.constant'

@Injectable()
export class TransfertService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly redisService: RedisService,
      private readonly gateway: Gateway,
   ) {}

   async initTransfert(initTransfertDto: InitTransfertDto) {
      try {
         const transaction = await this.prismaService.$transaction(
            async (prisma) => {
               const senderClientProfile = await prisma.profile.findUnique({
                  where: { phoneNumber: initTransfertDto.fromPhoneNumber },
                  select: {
                     sub: true,
                     phoneNumber: true,
                     firstName: true,
                     lastName: true,
                     gender: true,
                     clientProfile: {
                        select: {
                           walletPassword: true,
                           accountBalance: { select: { balance: true } },
                        },
                     },
                  },
               })
               if (!senderClientProfile.clientProfile.walletPassword) {
                  throw new BadRequestException(
                     "You don't have wallet password yet please chouse one",
                  )
               }
               const isMatch = await bcrypt.compare(
                  initTransfertDto.walletPassword,
                  senderClientProfile.clientProfile.walletPassword,
               )
               if (!isMatch) {
                  throw new BadRequestException('Incorrect password')
               }
               if (!senderClientProfile) {
                  throw new NotFoundException('Client sender not found')
               }
               if (
                  senderClientProfile.clientProfile.accountBalance.balance <
                  initTransfertDto.amount
               ) {
                  throw new BadRequestException(
                     'You do not have enough funds to make this transfer.',
                  )
               }
               const reseiverClientProfile = await prisma.profile.findUnique({
                  where: { phoneNumber: initTransfertDto.toPhoneNumber },
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
               const transfertRedisData: TransfertRedisDataInterface = {
                  from: senderClientProfile.sub,
                  to: reseiverClientProfile.sub,
                  amount: initTransfertDto.amount,
                  code: confirmationCode,
                  attempt: 3,
               }
               await this.redisService.set(
                  `${TRANSFERT_VALIDATION}-${senderClientProfile.sub}`,
                  JSON.stringify(transfertRedisData),
                  10 * 60,
               )
               await this.smsService.sendSMS(
                  [senderClientProfile.phoneNumber],
                  `Dear ${senderClientProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${senderClientProfile.lastName} ${senderClientProfile.firstName}, your transaction code is : ${confirmationCode}`,
               )
               return {
                  reseiverId: reseiverClientProfile.sub,
                  firstName: reseiverClientProfile.firstName,
                  lastName: reseiverClientProfile.lastName,
                  profilePhoto: reseiverClientProfile.profilePhoto,
                  amount: initTransfertDto.amount,
               }
            },
         )
         return transaction
      } catch (error) {
         throw error
      }
   }

   async validationTransfert(clientProfileId: string, code: string) {
      try {
         const transfertInfo: TransfertRedisDataInterface = JSON.parse(
            await this.redisService.get(
               `${TRANSFERT_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!transfertInfo) {
            throw new NotFoundException('Transfert information not found')
         }
         if (transfertInfo.code !== code) {
            if (transfertInfo.attempt > 1) {
               transfertInfo.attempt--
               const ttl = await this.redisService.ttl(
                  `${TRANSFERT_VALIDATION}-${clientProfileId}`,
               )
               await this.redisService.set(
                  `${TRANSFERT_VALIDATION}-${clientProfileId}`,
                  JSON.stringify(transfertInfo),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${transfertInfo.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${TRANSFERT_VALIDATION}-${clientProfileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }
         const transactionData = await this.prismaService.$transaction(
            async (prisma) => {
               const senderAccountBalance = await prisma.accountBalance.update({
                  where: {
                     clientProfileId: transfertInfo.from,
                     balance: { gt: transfertInfo.amount },
                  },
                  data: {
                     balance: {
                        decrement: transfertInfo.amount,
                     },
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
               const reseiverAccountBalance =
                  await prisma.accountBalance.update({
                     where: { clientProfileId: transfertInfo.to },
                     data: {
                        balance: { increment: transfertInfo.amount },
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
               const transaction = await prisma.paymentTransaction.create({
                  data: {
                     amount: transfertInfo.amount,
                     from: transfertInfo.from,
                     to: transfertInfo.to,
                     clientProfileId: transfertInfo.from,
                     paymentMethod: PaymentMethodType.RAPIDE_WALLET,
                     paymentTransactionStatus: PaymentTransactionStatus.SUCCESS,
                     paymentTransactionType: PaymentTransactionType.TRANSFERT,
                     fees: 0,
                     return: 0,
                     description: 'Transfert with rapide wallet.',
                  },
               })
               const reseiverProfile =
                  reseiverAccountBalance.clientProfile.profile
               const senderProfile = senderAccountBalance.clientProfile.profile
               await this.gateway.sendNotificationToClient(
                  reseiverProfile.sub,
                  EVENT_TRANSFERT,
                  { balance: reseiverAccountBalance.balance },
               )
               await this.gateway.sendNotificationToClient(
                  senderProfile.sub,
                  EVENT_TRANSFERT,
                  { balance: senderAccountBalance.balance },
               )
               await this.smsService.sendSMS(
                  [reseiverProfile.phoneNumber],
                  `Dear ${reseiverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${reseiverProfile.lastName} ${reseiverProfile.firstName}, your reseave ${transfertInfo.amount} Ar from ${senderProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${senderProfile.lastName} ${senderProfile.firstName}. The transaction code is ${transaction.reference.toString().padStart(6, '0')}`,
               )
               await this.redisService.remove(
                  `${TRANSFERT_VALIDATION}-${clientProfileId}`,
               )
               return {
                  senderAccountBalance,
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
         const transfertInfo: TransfertRedisDataInterface = JSON.parse(
            await this.redisService.get(
               `${TRANSFERT_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!transfertInfo) {
            throw new NotFoundException('transfert information not found')
         }
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         transfertInfo.code = confirmationCode
         const ttl = await this.redisService.ttl(
            `${TRANSFERT_VALIDATION}-${clientProfileId}`,
         )
         await this.redisService.set(
            `${TRANSFERT_VALIDATION}-${clientProfileId}`,
            JSON.stringify(transfertInfo),
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
            `Dear ${senderClientProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${senderClientProfile.lastName} ${senderClientProfile.firstName}, your transaction code is : ${transfertInfo.code}`,
         )
      } catch (error) {
         throw error
      }
   }
}
