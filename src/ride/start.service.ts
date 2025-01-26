import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RedisService } from 'src/redis/redis.service'

export interface StartDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class StartService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly gateway: Gateway,
      private redisService: RedisService,
   ) {}
   async start(startDto: StartDto) {
      try {
         const rideId = startDto.rideId

         const driverProfileId = startDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (
            rideData.status !==
            (RideStatus.DRIVER_ARRIVED || RideStatus.CLIENT_NOT_FOUND)
         ) {
            throw new Error(
               'Ride is not in DRIVER_ARRIVED or CLIENT_NOT_FOUND status',
            )
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
            status: RideStatus.ON_RIDE,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         const estimatedDuration = rideData.estimatedDuration
         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            estimatedDuration + 7200, // EstimatedDuration + 2 heures
         )

         await this.rideModel.update(
            {
               rideId,
            },
            {
               status: RideStatus.ON_RIDE,
               startTime: Date.now(),
            },
         )
         const clientProfileId = rideDataUpdated.clientProfileId
         const topic = 'startRide'
         this.gateway.sendNotificationToClient(clientProfileId, topic, {
            ...rideDataUpdated,
         })

         return { ...rideDataUpdated }
      } catch (error) {
         throw error
      }
   }
}
