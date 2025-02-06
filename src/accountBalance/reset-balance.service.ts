import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ResetBalanceServce {
   constructor(private readonly prismaService: PrismaService) {}

   async resetBalance(accountBalanceId: string) {
      const resetedAccountBalance =
         await this.prismaService.accountBalance.update({
            where: { accountBalanceId },
            data: { balance: 0, balanceStatus: 'ACTIVE' },
         })

      return resetedAccountBalance
   }
}
