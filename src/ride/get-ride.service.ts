import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { parseRidePostgresDataForRideData } from 'utils/rideDataParser.util'

@Injectable()
export class GetRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}

   async getRideDataBase(rideId: string): Promise<RideData> {
      // return await this.rideModel.get({ rideId })
      const rideData = await this.prismaService.ride.findUnique({ where: { rideId } })
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
