import { Injectable } from '@nestjs/common'
import { RideStatus } from '@prisma/client'
import { EVENT_RIDE_CHECKED } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class DeleteRideService {
   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
      private readonly gatway: Gateway,
   ) {}

   async deleteRide(rideId: string) {
      try {
         const rideDataString = await this.redisService.get(
            `${RIDE_PREFIX + rideId}`,
         )
         const rideData: RideData = JSON.parse(rideDataString)

         const updatedRide = await this.prismaService.ride.update({
            where: { rideId: rideData.rideId },
            data: { status: RideStatus.ADMIN_CANCELLED },
         })
         await this.redisService.remove(`${RIDE_PREFIX + rideId}`)
         await this.gatway.sendNotificationToClient(
            updatedRide.clientProfileId,
            EVENT_RIDE_CHECKED,
            {},
         )

         if (updatedRide.driverProfileId) {
            await this.gatway.sendNotificationToDriver(
               updatedRide.driverProfileId,
               EVENT_RIDE_CHECKED,
               {},
            )
         }
      } catch (error) {
         throw error
      }
   }
}
