import {
   Injectable,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common'
import { EVENT_INFO_ON_RIDE } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData } from 'interfaces/ride.interface'
import { Server } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { calculateRealTimeCostByTime } from 'utils/price.util'
import { roundToNearestThousand } from 'utils/roundToNearestThousand.utils'

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
      try {
         const ride = await this.redisService.get(RIDE_PREFIX + rideId)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

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
            realPrice: roundToNearestThousand(Number(realPrice.toFixed(2))),
         }
         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         const rideTTL = await this.redisService.ttl(`${RIDE_PREFIX + rideId}`)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            `${rideDataUpdatedString}`,
            rideTTL,
         )

         server.to(clientProfileId).emit(EVENT_INFO_ON_RIDE, rideDataUpdated)
         server.to(driverProfileId).emit(EVENT_INFO_ON_RIDE, rideDataUpdated)

         // console.log(rideDataUpdated)

         return rideDataUpdated
      } catch (error) {
         throw new InternalServerErrorException(
            'An unexpected error occurred while calculating and sharing ride info',
         )
      }
   }
}
