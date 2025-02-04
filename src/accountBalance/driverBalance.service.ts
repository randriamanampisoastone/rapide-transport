import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class DriverBalanceService {
   constructor(private readonly prismaService: PrismaService) {}
   async increaseBalance(driverProfileId: string, toIncreaseAmount: number) {
      const driver = await this.prismaService.profile.findUnique({
         where: { sub: driverProfileId },
         select: {
            driverProfile: {
               select: { accountBalance: { select: { balance: true } } },
            },
         },
      })
      const currentDriverBalance = driver.driverProfile.accountBalance.balance

      const updatedDriver = this.prismaService.accountBalance.update({
         where: {
            driverProfileId,
         },
         data: {
            balance: currentDriverBalance + toIncreaseAmount,
         },
      })

      return updatedDriver
   }
}
