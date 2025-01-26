import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RedisService } from 'src/redis/redis.service'

export interface ArrivedDestinationDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class ArrivedDestinationService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly gateway: Gateway,
      private redisService: RedisService,
   ) {}
   async arrivedDestination(arrivedDestinationDto: ArrivedDestinationDto) {
      try {
         const rideId = arrivedDestinationDto.rideId
         const driverProfileId = arrivedDestinationDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.ON_RIDE) {
            throw new Error('Ride is not in ON_RIDE status')
         }
         if (rideData.driverProfileId !== driverProfileId) {
            throw new Error('Driver is not the driver of the ride')
         }

         const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,
            ...rideDataRest
         } = rideData

         const rideDataUpdated = {
            status: RideStatus.ARRIVED_DESTINATION,
            driverProfileId,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            1800,
         )

         await this.rideModel.update(
            {
               rideId,
            },
            {
               status: RideStatus.ARRIVED_DESTINATION,
               endTime: Date.now(),
            },
         )
         const clientProfileId = rideDataUpdated.clientProfileId

         const topic = 'arrivedDestination'
         this.gateway.sendNotificationToClient(clientProfileId, topic, {
            ...rideDataUpdated,
         })
         return { ...rideDataUpdated }
      } catch (error) {
         throw error
      }
   }
}
