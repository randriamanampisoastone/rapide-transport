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
   MethodType,
   TransactionStatus,
   TransactionType,
} from '@prisma/client'
import { SmsService } from 'src/sms/sms.service'
import { Gateway } from 'src/gateway/gateway'
import { EVENT_DEPOSITE } from 'constants/event.constant'

@Injectable()
export class DepositeService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly gateWay: Gateway,
   ) {}

   async deposite(
      adminProfileId: string,
      clientProfileId: string,
      depositeDto: DepositeDto,
      locale: string,
   ) {
      try {
         const adminProfile = await this.prismaService.adminProfile.findUnique({
            where: { adminProfileId },
            select: { transactionPassword: true },
         })
         if (!adminProfile) {
            throw new NotFoundException('Admin profile note found')
         }
         if (!adminProfile.transactionPassword) {
            throw new BadRequestException('Transaction password not defined')
         }
         const isMatch = await bcrypt.compare(
            depositeDto.transactionPassword,
            adminProfile.transactionPassword,
         )
         if (!isMatch) {
            throw new BadRequestException('Password incorrect')
         }
         await this.prismaService.$transaction(async (prisma) => {
            const rapideWallet = await prisma.rapideWallet.update({
               where: { clientProfileId },
               data: {
                  balance: { increment: depositeDto.amount },
                  depositeCount: { increment: 1 },
                  transactionCount: { increment: 1 },
                  successCount: { increment: 1 },
               },
               include: { clientProfile: { include: { profile: true } } },
            })

            if (!rapideWallet) {
               throw new ForbiddenException(
                  'Error when trying to increment client balance',
               )
            }

            const transaction = await prisma.transaction.create({
               data: {
                  amount: depositeDto.amount,
                  from: adminProfileId,
                  to: clientProfileId,
                  method: depositeDto.methodType,
                  status: TransactionStatus.SUCCESS,
                  type: TransactionType.DEPOSIT,
                  clientProfiles: { connect: { clientProfileId } },
               },
            })

            const clientProfile = rapideWallet.clientProfile.profile

            let message: string = ''

            if (locale === 'fr') {
               message = `Chers ${clientProfile.gender === GenderType.FEMALE ? 'Mme.' : 'Mr.'} ${clientProfile.lastName} ${clientProfile.firstName}, vous avez reçu ${depositeDto.amount} Ar. La référence de la transaction est ${transaction.reference.toString().padStart(6, '0')}`
            } else if (locale === 'mg') {
               message = `Ry ${clientProfile.gender === GenderType.FEMALE ? 'Mme.' : 'Mr.'} ${clientProfile.lastName} ${clientProfile.firstName}, nahazo ${depositeDto.amount} Ar ianao. Ny laharana fanovozan-kevitra dia ${transaction.reference.toString().padStart(6, '0')}`
            } else if (locale === 'en') {
               message = `Dear ${clientProfile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${clientProfile.lastName} ${clientProfile.firstName}, you have received ${depositeDto.amount} Ar. The transaction reference is ${transaction.reference.toString().padStart(6, '0')}`
            } else if (locale === 'zh') {
               message = `尊敬的${clientProfile.gender === GenderType.FEMALE ? '女士' : '先生'}, 您已成功存款 ${depositeDto.amount}元, 交易参考号为${transaction.reference.toString().padStart(6, '0')}`
            } else {
               message = `Dear ${clientProfile.lastName} ${clientProfile.firstName}, you have received ${depositeDto.amount} Ar. The transaction reference is ${transaction.reference.toString().padStart(6, '0')}`
            }


            await this.smsService.sendSMS([clientProfile.phoneNumber], message)

            await this.gateWay.sendNotificationToClient(
               clientProfileId,
               EVENT_DEPOSITE,
               {
                  referance: transaction.reference,
                  paymentTransactionId: transaction.transactionId,
                  amount: depositeDto.amount,
               },
            )

            return {
               rapideWallet,
               transaction,
            }
         })
      } catch (error) {
         throw error
      }
   }
}
