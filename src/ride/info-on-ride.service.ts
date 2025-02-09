import { Injectable } from '@nestjs/common'
import { EVENT_INFO_ON_RIDE_PULL } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { UserRole } from 'enums/profile.enum'
import { Server } from 'socket.io'
import { RedisService } from 'src/redis/redis.service'
import { calculateRealTimeCostByTime } from 'utils/price.util'

@Injectable()
export class InfoOnRideService {
   constructor(private readonly redisService: RedisService) {}
   async infoOnRide(
      rideId: string,
      clientProfileId: string,
      driverProfileId: string,
      server: Server,
   ) {
      const ride = await this.redisService.get(RIDE_PREFIX + rideId)
      const rideData = JSON.parse(ride)

      const startTime = rideData.startTime
      const estimatedPrice = rideData.estimatedPrice
      const estimatedDuration = rideData.estimatedDuration

      const realPrice = calculateRealTimeCostByTime(
         Number(startTime),
         estimatedPrice,
         estimatedDuration,
      )

      const realDuration = Date.now() - Number(startTime)

      const rideDataUpdated = {
         ...rideData,
         realDuration: Math.floor(realDuration),
         realPrice: Number(realPrice.toFixed(2)),
      }
      const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

      // await this.redisService.set(
      //    `${RIDE_PREFIX + rideId}`,
      //    rideDataUpdatedString,
      // )

      // server
      //    .to(clientProfileId)
      //    .emit(EVENT_INFO_ON_RIDE_PULL, { realDuration, realPrice })
      // server
      //    .to(driverProfileId)
      //    .emit(EVENT_INFO_ON_RIDE_PULL, { realDuration, realPrice })
      // server
      //    .to(UserRole.ADMIN)
      //    .emit(EVENT_INFO_ON_RIDE_PULL, { ...rideDataUpdated })

      return rideDataUpdated
   }
}
