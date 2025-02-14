import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class DriverBalanceService {
   constructor(private readonly prismaService: PrismaService) {}
   async increaseBalance(driverProfileId: string, toIncreaseAmount: number) {
      try {
         const driver = await this.prismaService.profile.findUnique({
            where: { sub: driverProfileId },
            select: {
               driverProfile: {
                  select: { accountBalance: true },
               },
            },
         })
         const currentDriverBalance: number =
            driver.driverProfile.accountBalance.balance
         const accountBalanceId: string =
            driver.driverProfile.accountBalance.accountBalanceId

         const updatedDriver = this.prismaService.accountBalance.update({
            where: {
               accountBalanceId,
            },
            data: {
               balance: currentDriverBalance + toIncreaseAmount,
            },
         })

         return updatedDriver
      } catch (error) {
         throw error
      }
   }
   async getSold(driverProfileId: string) {
      try {
         const driver = await this.prismaService.profile.findUnique({
            where: { sub: driverProfileId },
            select: {
               driverProfile: {
                  select: {
                     accountBalance: {
                        select: {
                           balance: true,
                        },
                     },
                  },
               },
            },
         })
         return driver.driverProfile.accountBalance.balance
      } catch (error) {
         throw error
      }
   }
}
