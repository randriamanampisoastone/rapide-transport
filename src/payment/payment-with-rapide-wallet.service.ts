import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import {
   PaymentMethodType,
   PaymentTransactionStatus,
   PaymentTransactionType,
} from '@prisma/client'
import { profile } from 'console'
import { EVENT_PAYMENT } from 'constants/event.constant'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PaymentWithRapideWalletService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly gateway: Gateway,
   ) {}

   async payment(clientProfileId: string, to: string, amount: number) {
      try {
         const transactionData = await this.prismaService.$transaction(
            async (prisma) => {
               const accountBalance = await prisma.accountBalance.update({
                  where: { clientProfileId, balance: { gt: amount } },
                  data: { balance: { decrement: amount } },
               })

               if (!accountBalance) {
                  throw new BadRequestException(
                     'Please verify your balance and try again',
                  )
               }

               const profile = await prisma.profile.findUnique({
                  where: {
                     sub: to,
                  },
                  include: {
                     driverProfile: {
                        include: {
                           accountBalance: true,
                        },
                     },
                     clientProfile: {
                        include: {
                           accountBalance: true,
                        },
                     },
                  },
               })

               if (!profile) {
                  throw new NotFoundException('You try to send money to no one')
               }

               const receiverAccountBalanceId = profile.driverProfile
                  ? profile.driverProfile.accountBalance.accountBalanceId
                  : profile.clientProfile
                    ? profile.clientProfile.accountBalance.accountBalanceId
                    : null

               if (!receiverAccountBalanceId) {
                  throw new BadRequestException(
                     'The receiver does not have an account balance for the prossess',
                  )
               }

               await prisma.accountBalance.update({
                  where: {
                     accountBalanceId: receiverAccountBalanceId,
                  },
                  data: {
                     balance: {
                        increment: amount,
                     },
                  },
               })

               const transaction = await prisma.paymentTransaction.create({
                  data: {
                     amount: amount,
                     fees: 0,
                     return: 0,
                     paymentMethod: PaymentMethodType.RAPIDE_WALLET,
                     paymentTransactionStatus: PaymentTransactionStatus.PENDING,
                     paymentTransactionType: profile.clientProfile
                        ? PaymentTransactionType.TRANSFERT
                        : PaymentTransactionType.PAYMENT,
                     from: accountBalance.clientProfileId,
                     to: profile.sub,
                     clientProfileId: accountBalance.clientProfileId,
                     description: `${profile.clientProfile ? 'Transaction' : 'Payment'} with RapideBalance`,
                  },
               })

               await this.gateway.sendNotificationToClient(
                  accountBalance.clientProfileId,
                  EVENT_PAYMENT,
                  {
                     ...transaction,
                  },
               )
               await this.gateway.sendNotificationToAdmin(EVENT_PAYMENT, {
                  ...transaction,
               })
               if (profile.driverProfile) {
                  await this.gateway.sendNotificationToDriver(
                     profile.driverProfile.driverProfileId,
                     EVENT_PAYMENT,
                     { ...transaction },
                  )
               } else if (profile.clientProfile) {
                  await this.gateway.sendNotificationToClient(
                     profile.clientProfile.clientProfileId,
                     EVENT_PAYMENT,
                     { ...transaction },
                  )
               }
               return { accountBalance, transaction }
            },
         )

         return transactionData
      } catch (error) {
         throw error
      }
   }
}
