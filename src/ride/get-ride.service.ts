import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class GetRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly redisService: RedisService,
   ) {}

   async getRideDataBase(rideId: string): Promise<RideData> {
      return await this.rideModel.get({ rideId })
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
