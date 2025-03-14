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
                  select: { rapideWallet: true },
               },
            },
         })
         const currentDriverBalance: number =
            driver.driverProfile.rapideWallet.balance
         const rapideWalletId: string =
            driver.driverProfile.rapideWallet.rapideWalletId

         const updatedDriver = this.prismaService.rapideWallet.update({
            where: { rapideWalletId },
            data: { balance: currentDriverBalance + toIncreaseAmount },
         })

         return updatedDriver
      } catch (error) {
         throw error
      }
   }
   async getSold(profileId: string) {
      try {
         const driver = await this.prismaService.profile.findUnique({
            where: { sub: profileId },
            select: {
               driverProfile: {
                  select: {
                     rapideWallet: {
                        select: {
                           balance: true,
                        },
                     },
                  },
               },
            },
         })
         return driver.driverProfile.rapideWallet.balance
      } catch (error) {
         throw error
      }
   }
}
