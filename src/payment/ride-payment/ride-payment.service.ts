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
            10 * 60,
         )
         await this.smsService.sendSMS(
            [clientProfile.profile.phoneNumber],
            `Your transaction code is : ${confirmationCode}`,
         )
      } catch (error) {
         throw error
      }
   }

   async validateRapideWalletPayment(clientProfileId: string, code: string) {
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
               await this.smsService.sendSMS(
                  [clientProfile.phoneNumber],
                  `${realPrice} has been transfered to RAPIDE for this ride with ${driverProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${driverProfile.lastName} ${driverProfile.firstName}. The transaction reference is ${transaction.reference.toString().padStart(6, '0')}`,
               )
               await this.smsService.sendSMS(
                  [driverProfile.phoneNumber],
                  `${clientProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${clientProfile.lastName} ${clientProfile.firstName}, ${realPrice} Ar has been transfered to RAPIDE for this ride. The transaction reference is ${transaction.reference.toString().padStart(6, '0')}`,
               )
               await this.redisService.remove(
                  `${PAYMENT_VALIDATION}-${clientProfileId}`,
               )
            },
         )
         return transaction
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
