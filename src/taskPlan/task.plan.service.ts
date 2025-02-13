import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { DAILY_RAPIDE_BALANCE } from 'constants/redis.constant'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class TaskPlanService {
   constructor(private readonly redisService: RedisService) {}

   @Cron('0 0 * * *') // appeler minuit
   async resetRapideDailyBalance() {
      try {
         await this.redisService.remove(DAILY_RAPIDE_BALANCE)
      } catch (error) {
         throw error
      }
   }
}
