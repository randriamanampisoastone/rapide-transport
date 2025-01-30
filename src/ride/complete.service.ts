import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RedisService } from 'src/redis/redis.service'

export interface CompleteDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class CompleteService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly gateway: Gateway,
      private redisService: RedisService,
   ) {}
   async complete(completeDto: CompleteDto) {
      try {
         const rideId = completeDto.rideId
         const driverProfileId = completeDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         // if (rideData.status !== RideStatus.ARRIVED_DESTINATION) {
         //    throw new Error('Ride is not in ARRIVED_DESTINATION status')
         // }
         if (rideData.driverProfileId !== driverProfileId) {
            throw new Error('Driver is not the driver of the ride')
         }

         await this.redisService.remove(`${RIDE_PREFIX + rideId}`)

         await this.rideModel.update(
            {
               rideId,
            },
            {
               status: RideStatus.COMPLETED,
            },
         )
      } catch (error) {
         throw error
      }
   }
}
