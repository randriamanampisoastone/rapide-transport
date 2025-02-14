import { Injectable } from '@nestjs/common'
import { EVENT_INFO_ON_RIDE } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData } from 'interfaces/ride.interface'
import { Server } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { calculateRealTimeCostByTime } from 'utils/price.util'

@Injectable()
export class InfoOnRideService {
   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}
   async infoOnRide(
      rideId: string,
      clientProfileId: string,
      driverProfileId: string,
      server: Server,
   ) {
      const ride = await this.redisService.get(RIDE_PREFIX + rideId)
      const rideData: RideData = JSON.parse(ride)

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

      const rideTTL = await this.redisService.ttl(`${RIDE_PREFIX + rideId}`)
      await this.redisService.set(
         `${RIDE_PREFIX + rideId}`,
         `${rideDataUpdatedString}`,
         rideTTL + 2 * 60 * 60,
      )

      server.to(clientProfileId).emit(EVENT_INFO_ON_RIDE, rideDataUpdated)
      server.to(driverProfileId).emit(EVENT_INFO_ON_RIDE, rideDataUpdated)

      // console.log(rideDataUpdated)

      return rideDataUpdated
   }
}
