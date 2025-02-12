import { Injectable } from '@nestjs/common'
import { EVENT_DRIVER_DESTINATION } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

export interface ArrivedDestinationDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class ArrivedDestinationService {
   constructor(
      private readonly gateway: Gateway,
      private redisService: RedisService,
      private readonly prismaService: PrismaService,
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

         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               status: RideStatus.ARRIVED_DESTINATION,
               endTime: Date.now(),
            },
         })

         const clientProfileId = rideDataUpdated.clientProfileId

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_DRIVER_DESTINATION,
            {
               ...rideDataUpdated,
            },
         )

         this.gateway.sendNotificationToAdmin(EVENT_DRIVER_DESTINATION, {
            ...rideDataUpdated,
         })

         return { ...rideDataUpdated }
      } catch (error) {
         throw error
      }
   }
}
