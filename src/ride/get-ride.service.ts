import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData } from 'interfaces/ride.interface'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { parseRidePostgresDataForRideData } from 'utils/rideDataParser.util'

@Injectable()
export class GetRideService {
   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}

   async getRideDataBase(rideId: string): Promise<RideData> {
      const rideData = await this.prismaService.ride.findUnique({
         where: { rideId },
      })
      return parseRidePostgresDataForRideData(rideData)
   }
   async getRideRedis(rideId: string): Promise<RideData> {
      try {
         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)
         if (!ride) {
            throw new Error('Ride not found')
         }
         const rideData: RideData = JSON.parse(ride)
         return rideData
      } catch (error) {
         console.log('Error getting ride from Redis:', error)
         return null
      }
   }
}
