import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { RedisService } from 'src/redis/redis.service'
import { MethodType, TransactionStatus, TransactionType } from '@prisma/client'

@Injectable()
export class ResetBalanceServce {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly getRapideBalanceService: GetRapideBalanceService,
      private readonly redisService: RedisService,
   ) {}

   async createRapideBalance() {
      try {
         const rapideBalanceAlreadyExist =
            await this.prismaService.rapideBalance.findMany()
         if (rapideBalanceAlreadyExist.length) {
            throw new ConflictException('Rapide balance already exist')
         }
         await this.prismaService.rapideBalance.create({
            data: { food: 0, ride: 0, express: 0, mart: 0, rent: 0 },
         })
      } catch (error) {
         throw error
      }
   }

   async resetRideBalance(rapideWalletId: string) {
      try {
         await this.prismaService.$transaction(async (prisma) => {
            const rapideWallet = await prisma.rapideWallet.findUnique({
               where: { rapideWalletId },
               select: { balance: true, driverProfileId: true },
            })
            await prisma.rapideWallet.update({
               where: { rapideWalletId },
               data: { balance: 0 },
            })
            const rapideBalance =
               await this.getRapideBalanceService.getRapidebalance()
            await prisma.transaction.create({
               data: {
                  amount: Math.abs(rapideWallet.balance),
                  status: TransactionStatus.SUCCESS,
                  from: rapideWallet.driverProfileId,
                  to: 'RAPIDE BALANCE',
                  method: MethodType.RAPIDE_WALLET,
                  type: TransactionType.TRANSFER,
                  driverProfileId: rapideWallet.driverProfileId,
               },
            })
            await prisma.rapideBalance.update({
               where: {
                  rapideBalanceId: rapideBalance.rapideBalance.rapideBalanceId,
               },
               data: {
                  ride:
                     rapideBalance.rapideBalance.ride +
                     Math.abs(rapideWallet.balance),
               },
            })
            await this.redisService.upsertDailyRedisBalance(
               Math.abs(rapideWallet.balance),
            )
         })
      } catch (error) {
         throw error
      }
   }
}
