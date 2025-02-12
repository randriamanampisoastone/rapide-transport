import { Injectable } from '@nestjs/common'
import { EVENT_CLIENT_GIVE_UP } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

export interface ClientGiveUpDto {
   clientProfileId: string
   rideId: string
}

@Injectable()
export class ClientGiveUpService {
   constructor(
      private readonly gateway: Gateway,
      private redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}
   async clientGiveUp(clientGiveUpDto: ClientGiveUpDto) {
      try {
         const rideId = clientGiveUpDto.rideId
         const clientProfileId = clientGiveUpDto.clientProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.ON_RIDE) {
            throw new Error('Ride is not in ON_RIDE status')
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
            status: RideStatus.CLIENT_GIVE_UP,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            120, // 2 minutes
         )
         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               status: RideStatus.CLIENT_GIVE_UP,
            },
         })

         const driverProfileId = rideDataUpdated.driverProfileId

         this.gateway.sendNotificationToDriver(
            driverProfileId,
            EVENT_CLIENT_GIVE_UP,
            {},
         )
         this.gateway.sendNotificationToAdmin(EVENT_CLIENT_GIVE_UP, {
            ...rideDataUpdated,
         })
      } catch (error) {
         throw error
      }
   }
}
