import { Injectable, NotFoundException } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData } from 'interfaces/ride.interface'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { parseRideData } from 'utils/rideDataParser.util'

@Injectable()
export class GetRideService {
   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}

   async getRideDataBase(rideId: string): Promise<RideData> {
      try {
         const rideData = await this.prismaService.ride.findUnique({
            where: { rideId },
         })
         return parseRideData(rideData)
      } catch (error) {
         throw new NotFoundException(`No rides found with id: ${rideId}`)
      }
   }
   async getRideRedis(rideId: string): Promise<RideData> {
      try {
         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)
         if (!ride) {
            throw new Error('RideNotFound')
         }
         const rideData: RideData = JSON.parse(ride)
         return rideData
      } catch (error) {
         // console.log('Error getting ride from Redis:', error)
         // return null
         throw new NotFoundException(`No rides found with id: ${rideId}`)
      }
   }
}
