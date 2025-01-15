import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { Server } from 'socket.io'
import { RedisService } from 'src/redis/redis.service'
import { calculateRealTimeCostByTime } from 'utils/price.util'

@Injectable()
export class CalculatePriceService {
   constructor(private readonly redisService: RedisService) {}
   async calculateRealTimePrice(
      rideId: string,
      clientProfileId: string,
      driverProfileId: string,
      server: Server,
   ) {
      const ride = await this.redisService.get(RIDE_PREFIX + rideId)
      const rideData = JSON.parse(ride)
      console.log('Riiideee : ', rideData.estimatedPrice)
      rideData.realPrice = calculateRealTimeCostByTime(
         rideData.startTime,
         rideData.estimatedPrice,
         rideData.estimatedDuration,
      )
      console.log('Real price : ', rideData.realPrice)

      // await this.redisService.set(
      //    RIDE_PREFIX + rideId,
      //    JSON.stringify(rideData),
      // )
      server.to(clientProfileId).emit('calculatePrice', rideData.realPrice)
      server.to(driverProfileId).emit('calculatePrice', rideData.realPrice)
   }
}
