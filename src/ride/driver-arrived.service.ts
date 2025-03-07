import { Injectable } from '@nestjs/common'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { EVENT_DRIVER_ARREIVED } from 'constants/event.constant'

export interface DriverArrivedDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class DriverArrivedService {
   constructor(
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}

   async drivertArrived(driverArrivedDto: DriverArrivedDto) {
      try {
         const rideId = driverArrivedDto.rideId
         const driverProfileId = driverArrivedDto.driverProfileId

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
            status: RideStatus.DRIVER_ARRIVED,
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
               status: RideStatus.DRIVER_ARRIVED,
            },
         })
         const clientProfileId = rideDataUpdated.clientProfileId

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_DRIVER_ARREIVED,
            {},
         )
         this.gateway.sendNotificationToAdmin(EVENT_DRIVER_ARREIVED, {
            ...rideDataUpdated,
         })
      } catch (error) {
         throw error
      }
   }
}
