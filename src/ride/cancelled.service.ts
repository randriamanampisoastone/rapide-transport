import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RedisService } from 'src/redis/redis.service'

export interface CancelledDto {
   clientProfileId: string
   rideId: string
}

@Injectable()
export class CancelledService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private redisService: RedisService,
      private readonly gateway: Gateway,
   ) {}
   async cancelled(cancelledDto: CancelledDto) {
      try {
         const rideId = cancelledDto.rideId
         const clientProfileId = cancelledDto.clientProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.FINDING_DRIVER) {
            throw new HttpException(
               'NotFindingDriverStatus',
               HttpStatus.BAD_REQUEST,
            )
         }
         if (rideData.clientProfileId !== clientProfileId) {
            throw new Error('Client is not the client of the ride')
         }

         const pickUpLocation = rideData.pickUpLocation

         const vehicleType = rideData.vehicleType

         const drivers = await this.redisService.getDriversNearby(
            pickUpLocation,
            vehicleType,
         )

         await Promise.all(
            drivers.map((driver) =>
               this.gateway.sendNotificationToDriver(
                  driver.driverProfileId,
                  'cancelledRide',
                  rideId,
               ),
            ),
         )

         await this.redisService.remove(`${RIDE_PREFIX + rideId}`)

         await this.rideModel.update(
            {
               rideId,
            },
            {
               status: RideStatus.CANCELLED,
            },
         )
      } catch (error) {
         throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
         )
      }
   }
}
