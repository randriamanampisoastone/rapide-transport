import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { log } from 'console'

@Injectable()
export class ResetBalanceServce {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly getRapideBalanceService: GetRapideBalanceService,
   ) {}

   async resetRideBalance(accountBalanceId: string) {
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
            const rapideBalance =
               await this.getRapideBalanceService.getRapidebalance()
            await prisma.rapideBalance.update({
               where: { rapideBalanceId: rapideBalance.rapideBalanceId },
               data: { ride: rapideBalance.ride + accountBalance.balance },
            })
         })
      } catch (error) {
         throw error
      }
   }

   async resetAllRideBalance() {
      try {
         await this.prismaService.$transaction(async (prisma) => {
            const driversAccountBalance = await prisma.accountBalance.findMany({
               where: {
                  driverProfileId: { not: null },
               },
               select: {
                  accountBalanceId: true,
                  balance: true,
               },
            })
            const accountBalanceIds = driversAccountBalance.map(
               (driver) => driver.accountBalanceId,
            )
            const balanceTotal = driversAccountBalance.reduce(
               (total: number, driver) => total + driver.balance,
               0,
            )
            await prisma.accountBalance.updateMany({
               where: { accountBalanceId: { in: accountBalanceIds } },
               data: { balance: 0, balanceStatus: 'ACTIVE' },
            })
            const rapideBalance =
               await this.getRapideBalanceService.getRapidebalance()
            await prisma.rapideBalance.update({
               where: { rapideBalanceId: rapideBalance.rapideBalanceId },
               data: { ride: rapideBalance.ride + balanceTotal },
            })
         })
      } catch (error) {
         throw error
      }
   }
}
