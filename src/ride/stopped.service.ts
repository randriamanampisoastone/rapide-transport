import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { EVENT_CLIENT_STOPPED } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

export interface StoppedDto {
   clientProfileId: string
   rideId: string
}

@Injectable()
export class StoppedService {
   constructor(
      private readonly gateway: Gateway,
      private redisService: RedisService,
      private readonly prismaService: PrismaService,
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
         console.log('ooooooo', rideData.status)

         if (
            rideData.status !== RideStatus.DRIVER_ACCEPTED &&
            rideData.status !== RideStatus.DRIVER_ON_THE_WAY &&
            rideData.status !== RideStatus.DRIVER_ARRIVED
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

         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               status: RideStatus.STOPPED,
            },
         })
         const driverProfileId = rideDataUpdated.driverProfileId

         this.gateway.sendNotificationToDriver(
            driverProfileId,
            EVENT_CLIENT_STOPPED,
            {},
         )
         this.gateway.sendNotificationToAdmin(EVENT_CLIENT_STOPPED, {
            ...rideDataUpdated,
         })
      } catch (error) {
         throw error
      }
   }
}
