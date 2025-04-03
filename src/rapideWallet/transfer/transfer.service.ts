/* eslint-disable @typescript-eslint/no-unused-vars */
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
   UserRole,
} from '@prisma/client'
import { RedisService } from 'src/redis/redis.service'
import { TRANSFER_VALIDATION } from 'constants/redis.constant'
import { Gateway } from 'src/gateway/gateway'
import { EVENT_TRANSFER } from 'constants/event.constant'
import { TransferRedisDataInterface } from 'interfaces/transfer.redis.data.interface'

@Injectable()
export class TransferService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly redisService: RedisService,
      private readonly gateway: Gateway,
   ) {}

   async startTransfer(
      initTransferDto: InitTransferDto,
      role: UserRole,
      locale: string,
   ) {
      try {
         const selectRapideWallet = {
            select: {
               rapideWallet: {
                  select: {
                     rapideWalletId: true,
                     balance: true,
                     password: true,
                     status: true,
                  },
               },
            },
         }
         const transaction = await this.prismaService.$transaction(
            async (prisma) => {
               const sender = await prisma.profile.findUnique({
                  where: { phoneNumber: initTransferDto.fromPhoneNumber },
                  select: {
                     sub: true,
                     phoneNumber: true,
                     firstName: true,
                     lastName: true,
                     gender: true,
                     clientProfile: selectRapideWallet,
                     driverProfile: selectRapideWallet,
                  },
               })
               const senderRapideWallet =
                  role === UserRole.CLIENT
                     ? sender.clientProfile.rapideWallet
                     : sender.driverProfile.rapideWallet
               if (senderRapideWallet.status !== RapideWalletStatus.ACTIVE) {
                  throw new BadRequestException(
                     'Your rapide wallet is not ACTIVE',
                  )
               }
               const isMatch = await bcrypt.compare(
                  initTransferDto.walletPassword,
                  senderRapideWallet.password,
               )
               if (!isMatch) {
                  throw new BadRequestException('Incorrect password')
               }
               if (!sender) {
                  throw new NotFoundException('Sender not found')
               }
               if (
                  role === UserRole.CLIENT &&
                  senderRapideWallet.balance < initTransferDto.amount
               ) {
                  throw new BadRequestException(
                     'You do not have enough funds to make this transfer.',
                  )
               }
               const receiverRapideWallet = {
                  select: {
                     rapideWallet: {
                        select: {
                           rapideWalletId: true,
                           status: true,
                        },
                     },
                  },
               }
               const receiver = await prisma.profile.findUnique({
                  where: { phoneNumber: initTransferDto.toPhoneNumber },
                  select: {
                     sub: true,
                     lastName: true,
                     firstName: true,
                     profilePhoto: true,
                     clientProfile: receiverRapideWallet,
                     driverProfile: receiverRapideWallet,
                     role: true,
                  },
               })
               if (!receiver.sub) {
                  throw new NotFoundException(
                     "The user that you try to send money doesn't is not found",
                  )
               }
               const secret = speakeasy.generateSecret({ length: 20 })
               const confirmationCode = speakeasy.totp({
                  secret: secret.base32,
                  encoding: 'base32',
               })
               const receiverProfile = receiver.clientProfile
                  ? receiver.clientProfile
                  : receiver.driverProfile
               if (
                  receiverProfile.rapideWallet.status !==
                  RapideWalletStatus.ACTIVE
               ) {
                  throw new BadRequestException(
                     'The rapide wallet of the receiver is not ACTIVE',
                  )
               }
               const transferRedisData: TransferRedisDataInterface = {
                  from: sender.sub,
                  to: receiver.sub,
                  senderRapideWalletId: senderRapideWallet.rapideWalletId,
                  receiverRapideWalletId: receiver.clientProfile
                     ? receiver.clientProfile.rapideWallet.rapideWalletId
                     : receiver.driverProfile.rapideWallet.rapideWalletId,
                  receiverRole: receiver.role,
                  amount: initTransferDto.amount,
                  code: confirmationCode,
                  attempt: 3,
               }
               await this.redisService.set(
                  `${TRANSFER_VALIDATION}-${sender.sub}`,
                  JSON.stringify(transferRedisData),
                  10 * 60,
               )

               return {
                  receiverId: receiver.sub,
                  firstName: receiver.firstName,
                  lastName: receiver.lastName,
                  profilePhoto: receiver.profilePhoto,
                  amount: initTransferDto.amount,
                  phoneNumber: sender.phoneNumber,
                  confirmationCode,
               }
            },
         )

         let message = ''

         if (locale === 'fr') {
            message = `Votre code OTP pour la transaction est : ${transaction.confirmationCode}`
         } else if (locale === 'mg') {
            message = `Indro ny kaody OTP afahanao manamarina : ${transaction.confirmationCode}`
         } else if (locale === 'en') {
            message = `Your transaction code is : ${transaction.confirmationCode}`
         } else if (locale === 'zh') {
            message = `您的交易码 : ${transaction.confirmationCode}`
         }

         await this.smsService.sendSMS([transaction.phoneNumber], message)

         const { confirmationCode, phoneNumber, ...response } = transaction
         return response
      } catch (error) {
         throw error
      }
   }

   async confirmTransfer(
      profileId: string,
      code: string,
      role: UserRole,
      locale: string,
   ) {
      try {
         const transferInfo: TransferRedisDataInterface = JSON.parse(
            await this.redisService.get(`${TRANSFER_VALIDATION}-${profileId}`),
         )
         if (!transferInfo) {
            throw new NotFoundException('Transfer information not found')
         }
         if (transferInfo.code !== code) {
            if (transferInfo.attempt > 1) {
               transferInfo.attempt--
               const ttl = await this.redisService.ttl(
                  `${TRANSFER_VALIDATION}-${profileId}`,
               )
               await this.redisService.set(
                  `${TRANSFER_VALIDATION}-${profileId}`,
                  JSON.stringify(transferInfo),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${transferInfo.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${TRANSFER_VALIDATION}-${profileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }
         const transactionData = await this.prismaService.$transaction(
            async (prisma) => {
               const selectedProfile = {
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
               }
               const senderRapideWallet = await prisma.rapideWallet.update({
                  where: { rapideWalletId: transferInfo.senderRapideWalletId },
                  data: {
                     balance: { decrement: transferInfo.amount },
                     transferCount: { increment: 1 },
                     transactionCount: { increment: 1 },
                     successCount: { increment: 1 },
                  },
                  select: {
                     balance: true,
                     clientProfile: selectedProfile,
                     driverProfile: selectedProfile,
                  },
               })
               const receiverRapideWallet = await prisma.rapideWallet.update({
                  where: {
                     rapideWalletId: transferInfo.receiverRapideWalletId,
                  },
                  data: {
                     balance: { increment: transferInfo.amount },
                     transactionCount: { increment: 1 },
                     transferCount: { increment: 1 },
                     successCount: { increment: 1 },
                  },
                  select: {
                     balance: true,
                     clientProfile: selectedProfile,
                     driverProfile: selectedProfile,
                  },
               })
               const connect = []
               if (role === UserRole.CLIENT) {
                  connect.push({ clientProfileId: transferInfo.from })
               }
               if (transferInfo.receiverRole === UserRole.CLIENT) {
                  connect.push({ clientProfileId: transferInfo.to })
               }
               const transaction = await prisma.transaction.create({
                  data: {
                     amount: transferInfo.amount,
                     from: transferInfo.from,
                     to: transferInfo.to,
                     method: MethodType.RAPIDE_WALLET,
                     status: TransactionStatus.SUCCESS,
                     driverProfileId:
                        role === UserRole.DRIVER
                           ? transferInfo.from
                           : transferInfo.receiverRole === UserRole.DRIVER
                             ? transferInfo.to
                             : null,
                     clientProfiles: { connect },
                     type: TransactionType.TRANSFER,
                     fees: 0,
                     description: 'Transfer with rapide wallet.',
                  },
               })
               const receiverProfile = receiverRapideWallet.clientProfile
                  ? receiverRapideWallet.clientProfile.profile
                  : receiverRapideWallet.driverProfile.profile
               const senderProfile = senderRapideWallet.clientProfile
                  ? senderRapideWallet.clientProfile.profile
                  : senderRapideWallet.driverProfile.profile
               if (transferInfo.receiverRole === UserRole.CLIENT) {
                  await this.gateway.sendNotificationToClient(
                     receiverProfile.sub,
                     EVENT_TRANSFER,
                     { balance: receiverRapideWallet.balance },
                  )
               } else if (transferInfo.receiverRole === UserRole.DRIVER) {
                  await this.gateway.sendNotificationToDriver(
                     receiverProfile.sub,
                     EVENT_TRANSFER,
                     { balance: receiverRapideWallet.balance },
                  )
               }
               if (role === UserRole.CLIENT) {
                  await this.gateway.sendNotificationToClient(
                     senderProfile.sub,
                     EVENT_TRANSFER,
                     { balance: senderRapideWallet.balance },
                  )
               } else if (role === UserRole.DRIVER) {
                  await this.gateway.sendNotificationToDriver(
                     senderProfile.sub,
                     EVENT_TRANSFER,
                     { balance: senderRapideWallet.balance },
                  )
               }
               await this.redisService.remove(
                  `${TRANSFER_VALIDATION}-${profileId}`,
               )
               return {
                  senderRapideWallet,
                  receiverProfile,
                  senderProfile,
                  transaction,
               }
            },
         )
         const { receiverProfile, senderProfile, ...rest } = transactionData

         let messages = ['', '']

         if (locale === 'fr') {
            messages[0] = `Cher(e) ${receiverProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${receiverProfile.lastName} ${receiverProfile.firstName}, vous avez reçu ${transferInfo.amount} Ar de la part de ${senderProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${senderProfile.lastName} ${senderProfile.firstName}. Votre référence de transaction est ${transactionData.transaction.reference.toString().padStart(6, '0')}.`
            messages[1] = `Cher(e) ${senderProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${senderProfile.lastName} ${senderProfile.firstName}, vous avez transféré ${transferInfo.amount} Ar à ${receiverProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${receiverProfile.lastName} ${receiverProfile.firstName}. Votre référence de transaction est ${transactionData.transaction.reference.toString().padStart(6, '0')}.`
         } else if (locale === 'mg') {
            messages[0] = `Ry ${receiverProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${receiverProfile.lastName} ${receiverProfile.firstName}, nahazo ${transferInfo.amount} Ar avy amin'i ${senderProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${senderProfile.lastName} ${senderProfile.firstName} ianao. Ny laharana fanovozan-kevitrao dia ${transactionData.transaction.reference.toString().padStart(6, '0')}.`
            messages[1] = `Ry ${senderProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${senderProfile.lastName} ${senderProfile.firstName}, nandefa ${transferInfo.amount} Ar ho an'i ${receiverProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${receiverProfile.lastName} ${receiverProfile.firstName} ianao. Ny laharana fanovozan-kevitra dia ${transactionData.transaction.reference.toString().padStart(6, '0')}.`
         } else if (locale === 'en') {
            messages[0] = `Dear ${receiverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${receiverProfile.lastName} ${receiverProfile.firstName}, you have received ${transferInfo.amount} Ar from ${senderProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${senderProfile.lastName} ${senderProfile.firstName}. Your transaction reference is ${transactionData.transaction.reference.toString().padStart(6, '0')}.`
            messages[1] = `Dear ${senderProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${senderProfile.lastName} ${senderProfile.firstName}, you have transferred ${transferInfo.amount} Ar to ${receiverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${receiverProfile.lastName} ${receiverProfile.firstName}. Your transaction reference is ${transactionData.transaction.reference.toString().padStart(6, '0')}.`
         } else if (locale === 'zh') {
            messages[0] = `尊敬的${receiverProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${receiverProfile.lastName} ${receiverProfile.firstName}，您已收到来自${senderProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${senderProfile.lastName} ${senderProfile.firstName} 的 ${transferInfo.amount} Ar。您的交易参考号是 ${transactionData.transaction.reference.toString().padStart(6, '0')}。`
            messages[1] = `尊敬的${senderProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${senderProfile.lastName} ${senderProfile.firstName}，您已成功向 ${receiverProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${receiverProfile.lastName} ${receiverProfile.firstName} 转账 ${transferInfo.amount} Ar。您的交易参考号是 ${transactionData.transaction.reference.toString().padStart(6, '0')}。`
         }


         await this.smsService.sendSMS(
            [receiverProfile.phoneNumber],
            messages[0],
         )
         await this.smsService.sendSMS([senderProfile.phoneNumber], messages[1])
         return rest
      } catch (error) {
         throw error
      }
   }

   async resendCode(profileId: string, locale: string) {
      try {
         const transferInfo: TransferRedisDataInterface = JSON.parse(
            await this.redisService.get(`${TRANSFER_VALIDATION}-${profileId}`),
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
            `${TRANSFER_VALIDATION}-${profileId}`,
         )
         await this.redisService.set(
            `${TRANSFER_VALIDATION}-${profileId}`,
            JSON.stringify(transferInfo),
            ttl,
         )
         const sender = await this.prismaService.profile.findUnique({
            where: { sub: profileId },
            select: { phoneNumber: true },
         })
         let message = ''

         if (locale === 'fr') {
            message = `Votre code OTP pour la transaction est : ${transferInfo.code}`
         } else if (locale === 'mg') {
            message = `Indro ny kaody OTP afahanao manamarina : ${transferInfo.code}`
         } else if (locale === 'en') {
            message = `Your transaction code is : ${transferInfo.code}`
         } else if (locale === 'zh') {
            message = `您的交易码 : ${transferInfo.code}`
         }

         await this.smsService.sendSMS(
            [sender.phoneNumber],
            `Your transaction code is : ${transferInfo.code}`,
         )
      } catch (error) {
         throw error
      }
   }
}
