import { Injectable } from '@nestjs/common'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'

export interface ClientNotFoundDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class ClientNotFoundService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
   ) {}

   async clientNotFound(clientNotFoundDto: ClientNotFoundDto) {
      try {
         const rideId = clientNotFoundDto.rideId
         const driverProfileId = clientNotFoundDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.DRIVER_ON_THE_WAY) {
            throw new Error('Ride is not in DRIVER_ON_THE_WAY status')
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
            status: RideStatus.CLIENT_NOT_FOUND,
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
               status: RideStatus.CLIENT_NOT_FOUND,
            },
         )
         const clientProfileId = rideDataUpdated.clientProfileId

         const topic = 'clientNotFound'
         this.gateway.sendNotificationToClient(clientProfileId, topic, {})
      } catch (error) {
         throw error
      }
   }
}
