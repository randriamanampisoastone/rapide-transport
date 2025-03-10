import {
   ForbiddenException,
   HttpException,
   HttpStatus,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { EVENT_CANCELLED_RIDE } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { parseRidePostgresDataForRideData } from 'utils/rideDataParser.util'

export interface CancelledDto {
   clientProfileId: string
   rideId: string
}

@Injectable()
export class CancelledService {
   constructor(
      private redisService: RedisService,
      private readonly gateway: Gateway,
      private readonly prismaService: PrismaService,
   ) {}
   async cancelled(cancelledDto: CancelledDto) {
      try {
         const rideId = cancelledDto.rideId
         const clientProfileId = cancelledDto.clientProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

         const rideData: RideData = JSON.parse(ride)

         await this.prismaService.clientProfile.update({
            where: {
               clientProfileId: rideData.clientProfileId,
            },
            data: {
               cancelledRide: {
                  increment: 1,
               },
            },
         })

         if (rideData.status !== RideStatus.FINDING_DRIVER) {
            throw new HttpException(
               'Not finding driver status',
               HttpStatus.BAD_REQUEST,
            )
         }
         if (rideData.clientProfileId !== clientProfileId) {
            // throw new Error('Client is not the client of the ride')
            throw new ForbiddenException('Client is not the client of the ride')
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

         const rideUpdated = await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               status: RideStatus.CANCELLED,
            },
         })
         this.gateway.sendNotificationToAdmin(EVENT_CANCELLED_RIDE, {
            ...parseRidePostgresDataForRideData(rideUpdated),
         })
      } catch (error) {
         throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
         )
      }
   }
}
