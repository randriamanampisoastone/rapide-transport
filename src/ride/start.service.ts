import {
   BadRequestException,
   ForbiddenException,
   HttpException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { EVENT_START_RIDE } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

export interface StartDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class StartService {
   constructor(
      private readonly gateway: Gateway,
      private redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}
   async start(startDto: StartDto) {
      try {
         const rideId = startDto.rideId

         const driverProfileId = startDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

         const rideData: RideData = JSON.parse(ride)

         if (
            rideData.status !==
            (RideStatus.DRIVER_ARRIVED || RideStatus.CLIENT_NOT_FOUND)
         ) {
            // throw new Error(
            //    'Ride is not in DRIVER_ARRIVED or CLIENT_NOT_FOUND status',
            // )
            throw new BadRequestException(
               'Ride is not in DRIVER_ARRIVED or CLIENT_NOT_FOUND status',
            )
         }
         if (rideData.driverProfileId !== driverProfileId) {
            // throw new Error('Driver is not the driver of the ride')
            throw new ForbiddenException('Driver is not the driver of the ride')
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

         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               status: RideStatus.ON_RIDE,
               startTime: Date.now(),
            },
         })
         const clientProfileId = rideDataUpdated.clientProfileId
         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_START_RIDE,
            {
               ...rideDataUpdated,
            },
         )

         return { ...rideDataUpdated }
      } catch (error) {
         // throw error
         throw new HttpException(error.message, error.status)
      }
   }
}
