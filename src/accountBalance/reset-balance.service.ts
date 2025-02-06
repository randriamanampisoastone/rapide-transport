import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetRapideBalanceService } from './get-rapide-balance.service'

@Injectable()
export class ResetBalanceServce {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly getRapideBalanceService: GetRapideBalanceService,
   ) {}

   async resetBalance(accountBalanceId: string) {
      try {
         await this.prismaService.$transaction(async (prisma) => {
            const accountBalance = await prisma.accountBalance.findUnique({
               where: { accountBalanceId },
               select: { balance: true },
            })
            await prisma.accountBalance.update({
               where: { accountBalanceId },
               data: { balance: 0, balanceStatus: 'ACTIVE' },
            })
            const rapideBalance = await this.getRapideBalanceService.getRapidebalance()
            await prisma.rapideBalance.update({
               where: {  rapideBalanceId: rapideBalance.rapideBalanceId },
               data: { balance: rapideBalance.balance + accountBalance.balance },
            })
         })
      } catch (error) {
         throw error
      }
   }
}
