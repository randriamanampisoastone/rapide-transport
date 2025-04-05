import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { InitRapideWalletPayment } from './dto/initRapideWalletPayment.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import { SmsService } from 'src/sms/sms.service'
import { GenderType } from 'enums/profile.enum'
import { PaymentRideWalletInterface } from 'interfaces/payment.ride.wallet.interface'
import { RedisService } from 'src/redis/redis.service'
import { PAYMENT_VALIDATION } from 'constants/redis.constant'
import { MethodType, TransactionStatus, TransactionType } from '@prisma/client'

@Injectable()
export class RidePaymentService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly redisService: RedisService,
   ) {}

   async startPaymentWithRapideWallet(
      clientProfileId: string,
      initRapideWalletPayment: InitRapideWalletPayment,
      locale: string,
   ) {
      try {
         const clientProfile =
            await this.prismaService.clientProfile.findUnique({
               where: { clientProfileId },
               select: {
                  profile: {
                     select: {
                        gender: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                     },
                  },
                  rapideWallet: {
                     select: {
                        password: true,
                        balance: true,
                     },
                  },
               },
            })

         if (
            initRapideWalletPayment.upperPrice >
            clientProfile.rapideWallet.balance
         ) {
            throw new BadRequestException('Insufficient balance')
         }
         if (!clientProfile) {
            throw new NotFoundException('Client not found')
         }
         const isMatch = await bcrypt.compare(
            initRapideWalletPayment.password,
            clientProfile.rapideWallet.password,
         )
         if (!isMatch) {
            throw new BadRequestException('Password incorrect')
         }
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         const paymentValidation: PaymentRideWalletInterface = {
            code: confirmationCode,
            from: clientProfileId,
            to: '',
            isValided: false,
            attempt: 3,
         }
         await this.redisService.set(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
            JSON.stringify(paymentValidation),
            15 * 60, // 15 minutes
         )
         let message = ''

         if (locale === 'fr') {
            message = `Votre code OTP pour la transaction est : ${confirmationCode}`
         } else if (locale === 'mg') {
            message = `Indro ny kaody OTP afahanao manamarina : ${confirmationCode}`
         } else if (locale === 'en') {
            message = `Your transaction code is : ${confirmationCode}`
         } else if (locale === 'zh') {
            message = `您的交易码 : ${confirmationCode}`
         }

         await this.smsService.sendSMS(
            [clientProfile.profile.phoneNumber],
            message,
         )
      } catch (error) {
         throw error
      }
   }

   async confirmRapideWalletPayment(clientProfileId: string, code: string) {
      try {
         const paymentValidation: PaymentRideWalletInterface = JSON.parse(
            await this.redisService.get(
               `${PAYMENT_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (code !== paymentValidation.code) {
            if (paymentValidation.attempt > 1) {
               paymentValidation.attempt--
               const ttl = await this.redisService.ttl(
                  `${PAYMENT_VALIDATION}-${clientProfileId}`,
               )
               await this.redisService.set(
                  `${PAYMENT_VALIDATION}-${clientProfileId}`,
                  JSON.stringify(paymentValidation),
                  ttl,
               )
               throw new BadRequestException(
                  `Incorrect OTP code. You have ${paymentValidation.attempt} attempt left.`,
               )
            } else {
               await this.redisService.remove(
                  `${PAYMENT_VALIDATION}-${clientProfileId}`,
               )
               throw new BadRequestException(
                  'You have no attempts left. Please try again later.',
               )
            }
         }
         paymentValidation.isValided = true
         const ttl = await this.redisService.ttl(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
         )
         await this.redisService.set(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
            JSON.stringify(paymentValidation),
            ttl,
         )
      } catch (error) {
         throw error
      }
   }

   async resendConfirmRapideWalletPayment(
      clientProfileId: string,
      locale: string,
   ) {
      try {
         const paymentValidation: PaymentRideWalletInterface = JSON.parse(
            await this.redisService.get(
               `${PAYMENT_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!paymentValidation) {
            throw new NotFoundException(
               'Ride payment with rapide wallet not found',
            )
         }
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         paymentValidation.code = confirmationCode
         const ttl = await this.redisService.ttl(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
         )
         await this.redisService.set(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
            JSON.stringify(paymentValidation),
            ttl,
         )
         const clientProfile = await this.prismaService.profile.findUnique({
            where: { sub: clientProfileId },
            select: { phoneNumber: true },
         })

         let message = ''

         if (locale === 'fr') {
            message = `Votre code OTP pour la transaction est : ${confirmationCode}`
         } else if (locale === 'mg') {
            message = `Indro ny kaody OTP afahanao manamarina : ${confirmationCode}`
         } else if (locale === 'en') {
            message = `Your transaction code is : ${confirmationCode}`
         } else if (locale === 'zh') {
            message = `您的交易码 : ${confirmationCode}`
         }

         await this.smsService.sendSMS([clientProfile.phoneNumber], message)
      } catch (error) {
         throw error
      }
   }

   async setReceiverAndTtl(clientProfileId: string, to: string, ttl: number) {
      try {
         const paymentValidation: PaymentRideWalletInterface = JSON.parse(
            await this.redisService.get(
               `${PAYMENT_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!paymentValidation.isValided) {
            throw new BadRequestException('Payment not validated')
         }
         paymentValidation.to = to
         await this.redisService.set(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
            JSON.stringify(paymentValidation),
            ttl,
         )
      } catch (error) {
         throw error
      }
   }

   async processPaymentWithRapideWallet(
      rideInvoiceId: string,
      clientProfileId: string,
      realPrice: number,
      locale: string,
   ) {
      try {
         const paymentValidation: PaymentRideWalletInterface = JSON.parse(
            await this.redisService.get(
               `${PAYMENT_VALIDATION}-${clientProfileId}`,
            ),
         )
         if (!paymentValidation.isValided) {
            throw new BadRequestException('Payment not validated')
         }
         const transaction = await this.prismaService.$transaction(
            async (prisma) => {
               const clientRapideWallet = await prisma.rapideWallet.update({
                  where: { clientProfileId },
                  data: {
                     balance: { decrement: realPrice },
                     transactionCount: { increment: 1 },
                     successCount: { increment: 1 },
                     paymentCount: { increment: 1 },
                  },
                  select: {
                     clientProfile: {
                        select: {
                           profile: {
                              select: {
                                 gender: true,
                                 phoneNumber: true,
                                 firstName: true,
                                 lastName: true,
                              },
                           },
                        },
                     },
                  },
               })
               const driverProfile = await prisma.profile.findUnique({
                  where: { sub: paymentValidation.to },
                  select: {
                     firstName: true,
                     lastName: true,
                     gender: true,
                     phoneNumber: true,
                  },
               })
               await prisma.rapideBalance.updateMany({
                  data: { ride: { increment: realPrice } },
               })
               const transaction = await prisma.transaction.create({
                  data: {
                     from: clientProfileId,
                     to: 'RAPIDE BALANCE',
                     amount: realPrice,
                     clientProfiles: { connect: { clientProfileId } },
                     status: TransactionStatus.SUCCESS,
                     type: TransactionType.PAYMENT,
                     method: MethodType.RAPIDE_WALLET,
                     rideInvoiceId,
                  },
               })
               const clientProfile = clientRapideWallet.clientProfile.profile
               await this.redisService.remove(
                  `${PAYMENT_VALIDATION}-${clientProfileId}`,
               )
               return { transaction, clientProfile, driverProfile }
            },
         )
         const { clientProfile, driverProfile, ...response } = transaction
         const messages: string[] = ['', '']
         if (locale === 'fr') {
            messages[0] = `${realPrice} Ar ont été transférés à RAPIDE pour cette course avec ${driverProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${driverProfile.lastName} ${driverProfile.firstName}. Votre référence de transaction est ${response.transaction.reference.toString().padStart(6, '0')}.`
            messages[1] = `Cher(e) ${driverProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${driverProfile.lastName} ${driverProfile.firstName}, ${realPrice} Ar ont été transférés à RAPIDE pour cette course au nom de ${clientProfile.gender === GenderType.FEMALE ? 'Mme.' : 'M.'} ${clientProfile.lastName} ${clientProfile.firstName}. La référence de la transaction est ${response.transaction.reference.toString().padStart(6, '0')}.`
         } else if (locale === 'mg') {
            messages[0] = `${realPrice} Ar dia nalefa tany amin'ny RAPIDE ho an'ity dia natao niaraka tamin'i ${driverProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${driverProfile.lastName} ${driverProfile.firstName}. Ny laharana fanovozan-kevitrao dia ${response.transaction.reference.toString().padStart(6, '0')}.`
            messages[1] = `Ry ${driverProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${driverProfile.lastName} ${driverProfile.firstName}, ${realPrice} Ar dia nalefa tany amin'ny RAPIDE ho an'ity dia natao ho an'i ${clientProfile.gender === GenderType.FEMALE ? 'Ramatoa' : 'Andriamatoa'} ${clientProfile.lastName} ${clientProfile.firstName}. Ny laharana fanovozan-kevitra dia ${response.transaction.reference.toString().padStart(6, '0')}.`
         } else if (locale === 'en') {
            messages[0] = `${realPrice} Ar has been transferred to RAPIDE for this ride with ${driverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${driverProfile.lastName} ${driverProfile.firstName}. Your transaction reference is ${response.transaction.reference.toString().padStart(6, '0')}.`
            messages[1] = `Dear ${driverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${driverProfile.lastName} ${driverProfile.firstName}, ${realPrice} Ar has been transferred to RAPIDE for this ride on behalf of ${clientProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${clientProfile.lastName} ${clientProfile.firstName}. The transaction reference is ${response.transaction.reference.toString().padStart(6, '0')}.`
         } else if (locale === 'zh') {
            messages[0] = `${realPrice} Ar 已转账至 RAPIDE，用于本次行程，乘客：${driverProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${driverProfile.lastName} ${driverProfile.firstName}。您的交易参考号是 ${response.transaction.reference.toString().padStart(6, '0')}。`
            messages[1] = `尊敬的${driverProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${driverProfile.lastName} ${driverProfile.firstName}，${realPrice} Ar 已转账至 RAPIDE，用于本次行程，由 ${clientProfile.gender === GenderType.FEMALE ? '女士' : '先生'} ${clientProfile.lastName} ${clientProfile.firstName} 代付。交易参考号为 ${response.transaction.reference.toString().padStart(6, '0')}。`
         }

         await this.smsService.sendSMS([clientProfile.phoneNumber], messages[0])
         await this.smsService.sendSMS([driverProfile.phoneNumber], messages[1])
         return response
      } catch (error) {
         throw error
      }
   }

   async cashPayment(
      clientProfileId: string,
      driverProfileId: string,
      rideInvoiceId: string,
      amount: number,
   ) {
      try {
         const transactionData = await this.prismaService.$transaction(
            async (prisma) => {
               await prisma.rapideWallet.update({
                  where: { driverProfileId },
                  data: {
                     balance: { decrement: amount },
                     successCount: { increment: 1 },
                     transactionCount: { increment: 1 },
                  },
               })
               const transaction = await prisma.transaction.create({
                  data: {
                     rideInvoiceId,
                     from: clientProfileId,
                     to: driverProfileId,
                     amount,
                     clientProfiles: { connect: { clientProfileId } },
                     driverProfileId,
                     status: TransactionStatus.SUCCESS,
                     type: TransactionType.PAYMENT,
                     method: MethodType.CASH,
                  },
               })
               return transaction
            },
         )
         return transactionData
      } catch (error) {
         throw error
      }
   }
}
