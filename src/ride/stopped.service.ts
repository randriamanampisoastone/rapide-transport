import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RedisService } from 'src/redis/redis.service'

export interface StoppedDto {
   clientProfileId: string
   rideId: string
}

@Injectable()
export class StoppedService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly gateway: Gateway,
      private redisService: RedisService,
   ) {}
   async clientStopped(stoppedDto: StoppedDto) {
      try {
         const rideId = stoppedDto.rideId
         const clientProfileId = stoppedDto.clientProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (
            rideData.status !== RideStatus.DRIVER_ACCEPTED &&
            rideData.status !== RideStatus.DRIVER_ON_THE_WAY
         ) {
            throw new HttpException(
               'NotDriverAcceptOrDriverOnTheWayStatus',
               HttpStatus.BAD_REQUEST,
            )
         }
         if (rideData.clientProfileId !== clientProfileId) {
            throw new Error('Client is not the client of the ride')
         }

         const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,
            ...rideDataRest
         } = rideData

         const rideDataUpdated = {
            status: RideStatus.STOPPED,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            3600, // 1 hour
         )

         await this.rideModel.update(
            {
               rideId,
            },
            {
               status: RideStatus.STOPPED,
            },
         )
         const driverProfileId = rideDataUpdated.driverProfileId

         const topic = 'clientStopped'
         this.gateway.sendNotificationToDriver(driverProfileId, topic, {})
      } catch (error) {
         throw error
      }
   }
}
