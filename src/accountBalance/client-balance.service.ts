import { Injectable } from '@nestjs/common'
import {
   PaymentTransactionStatus,
   PaymentTransactionType,
   UserRole,
} from '@prisma/client'
import {
   EVENT_ACCEPTED_RIDE,
   EVENT_SET_CLIENT_BALANCE,
} from 'constants/event.constant'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { IncrementClientAccountBalanceDto } from './dto/client-account-balance.dto'

@Injectable()
export class ClientBalanceService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly gateway: Gateway,
   ) {}

   async incrementClientBalanceByAdmin(
      clientProfileId: string,
      incrementClientAccountBalanceDto: IncrementClientAccountBalanceDto,
   ) {
      try {
         const transactionData = await this.prismaService.$transaction(
            async (prisma) => {
               const accountBalance = await prisma.accountBalance.update({
                  where: {
                     clientProfileId,
                  },
                  data: {
                     balance: {
                        increment: incrementClientAccountBalanceDto.amount,
                     },
                  },
               })

               const transaction = await prisma.paymentTransaction.create({
                  data: {
                     amount: incrementClientAccountBalanceDto.amount,
                     fees: 0,
                     return: 0,
                     paymentMethod:
                        incrementClientAccountBalanceDto.paymentMethode,
                     paymentTransactionStatus: PaymentTransactionStatus.PENDING,
                     paymentTransactionType: PaymentTransactionType.DEPOSIT,
                     from: UserRole.ADMIN,
                     to: accountBalance.clientProfileId,
                     clientProfileId: accountBalance.clientProfileId,
                     description: 'Deposit from Rapide App',
                  },
               })

               await this.gateway.sendNotificationToClient(
                  accountBalance.clientProfileId,
                  EVENT_SET_CLIENT_BALANCE,
                  {
                     ...incrementClientAccountBalanceDto,
                     paymentTransactionStatus: PaymentTransactionStatus.PENDING,
                     paymentTransactionType: PaymentTransactionType.DEPOSIT,
                     paymentTransactionId: transaction.paymentTransactionId,
                     reference: transaction.reference,
                  },
               )

               return { accountBalance, transaction }
            },
         )

         return transactionData
      } catch (error) {
         throw error
      }
   }

   async decrementClientBalanceByAdmin(
      clientProfileId: string,
      decrementClientAccountBalanceDto: IncrementClientAccountBalanceDto,
   ) {
      try {
         const transactiondata = await this.prismaService.$transaction(
            async (prisma) => {
               const accountBalance = await prisma.accountBalance.update({
                  where: {
                     clientProfileId,
                  },
                  data: {
                     balance: {
                        decrement: decrementClientAccountBalanceDto.amount,
                     },
                  },
               })

               const transaction = await prisma.paymentTransaction.create({
                  data: {
                     amount: decrementClientAccountBalanceDto.amount,
                     fees: 0,
                     return: 0,
                     paymentMethod:
                        decrementClientAccountBalanceDto.paymentMethode,
                     paymentTransactionStatus: PaymentTransactionStatus.PENDING,
                     paymentTransactionType: PaymentTransactionType.RETRAIT,
                     from: accountBalance.clientProfileId,
                     to: UserRole.ADMIN,
                     clientProfileId: accountBalance.clientProfileId,
                     description: 'Retrait from Rapide App',
                  },
               })

               await this.gateway.sendNotificationToClient(
                  accountBalance.clientProfileId,
                  EVENT_SET_CLIENT_BALANCE,
                  {
                     ...decrementClientAccountBalanceDto,
                     paymentTransactionStatus: PaymentTransactionStatus.PENDING,
                     paymentTransactionType: PaymentTransactionType.DEPOSIT,
                     paymentTransactionId: transaction.paymentTransactionId,
                     reference: transaction.reference,
                  },
               )

               return { accountBalance, transaction }
            },
         )

         return transactiondata
      } catch (error) {
         throw error
      }
   }
}
