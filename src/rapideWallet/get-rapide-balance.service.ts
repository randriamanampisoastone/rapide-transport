import { Injectable } from '@nestjs/common'
import { DAILY_RAPIDE_BALANCE } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class GetRapideBalanceService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly redisService: RedisService,
   ) {}

   async getRapidebalance() {
      try {
         const rapideBalance = await this.prismaService.rapideBalance.findMany()
         const dailyRapideBalance: number = parseInt(
            await this.redisService.get(DAILY_RAPIDE_BALANCE),
         )
         return {
            rapideBalance: rapideBalance[0],
            dailyRapideBalance: dailyRapideBalance || 0,
         }
      } catch (error) {
         throw error
      }
   }
}
