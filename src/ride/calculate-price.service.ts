import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { calculateRealTimeCostByTime } from 'utils/price.util'

@Injectable()
export class CalculatePriceService {
   constructor(private readonly redisService: RedisService) {}
   async calculateRealTimePrice(rideId: string) {
      const ride = await this.redisService.get(rideId)
      const rideData = JSON.parse(ride)
      rideData.realPrice = calculateRealTimeCostByTime(
         rideData.startTimes,
         rideData.estimatedPrice,
         rideData.estimatedDuration,
      )
      await this.redisService.set(rideId, JSON.stringify(rideData))
   }
}
