import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { DepositeDto } from './dto/deposite.dto'
import * as bcrypt from 'bcrypt'
import {
   GenderType,
   PaymentMethodType,
   PaymentTransactionStatus,
   PaymentTransactionType,
} from '@prisma/client'
import { SmsService } from 'src/sms/sms.service'
import { Gateway } from 'src/gateway/gateway'
import { EVENT_DEPOSITE } from 'constants/event.constant'
import { AmountDto } from 'src/accountBalance/dto/amount.dto'

@Injectable()
export class DepositeService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly gateWay: Gateway
   ) {}

   async deposite(
      adminProfileId: string,
      clientProfileId: string,
      depositeDto: DepositeDto,
   ) {
      try {
         const adminProfile = await this.prismaService.adminProfile.findUnique({
            where: { adminProfileId },
            select: { transactionPassword: true },
         })
         if (!adminProfile) {
            throw new NotFoundException('Admin profile note found')
         }
         const isMatch = await bcrypt.compare(
            depositeDto.transactionPassword,
            adminProfile.transactionPassword,
         )
         if (!isMatch) {
            throw new BadRequestException('Password incorrect')
         }
         const transaction = await this.prismaService.$transaction(
            async (prisma) => {
               const accountBalance = await prisma.accountBalance.update({
                  where: { clientProfileId },
                  data: { balance: { increment: depositeDto.amount } },
                  include: { clientProfile: { include: { profile: true } } },
               })

               if (!accountBalance) {
                  throw new ForbiddenException(
                     'Error when trying to increment client balance',
                  )
               }

               const transaction = await prisma.paymentTransaction.create({
                  data: {
                     amount: depositeDto.amount,
                     from: adminProfileId,
                     to: clientProfileId,
                     fees: 0,
                     return: 0,
                     paymentMethod: depositeDto.paymentMethodType,
                     paymentTransactionStatus: PaymentTransactionStatus.SUCCESS,
                     paymentTransactionType: PaymentTransactionType.DEPOSIT,
                     clientProfileId: clientProfileId,
                  },
               })

               const clientProfile = accountBalance.clientProfile.profile

               await this.smsService.sendSMS(
                  [clientProfile.phoneNumber],
                  `Dear ${clientProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${clientProfile.lastName} ${clientProfile.firstName}, you have received ${depositeDto.amount} Ar. The transaction reference is ${transaction.reference.toString().padStart(6, '0')}`,
               )

               await this.gateWay.sendNotificationToClient(clientProfileId, EVENT_DEPOSITE, {
                  referance: transaction.reference,
                  paymentTransactionId: transaction.paymentTransactionId,
                  amount: depositeDto.amount,
               })

               return {
                  accountBalance,
                  transaction,
               }
            },
         )
      } catch (error) {
         throw error
      }
   }
}
