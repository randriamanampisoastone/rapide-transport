import {
   BadRequestException,
   ForbiddenException,
   Injectable,
} from '@nestjs/common'
import { ProfileStatus, RideStatus } from '@prisma/client'
import { EVENT_ASSIGN_RIDE_TO_DRIVER } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class AssignRideToDriverService {
   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
      private readonly gatway: Gateway,
   ) {}

   async assignRideToDriver(driverProfileId: string, rideId: string) {
      try {
         const driver = await this.prismaService.driverProfile.findUnique({
            where: { driverProfileId },
            select: { status: true },
         })

         if (driver.status !== ProfileStatus.ACTIVE) {
            throw new ForbiddenException('The driver is not active')
         }

         const rideDataString = await this.redisService.get(
            `${RIDE_PREFIX + rideId}`,
         )
         const rideData: RideData = JSON.parse(rideDataString)

         if (rideData.status !== RideStatus.FINDING_DRIVER) {
            throw new ForbiddenException('Ride already have a driver')
         }

         if (rideData.driverProfileId) {
            throw new BadRequestException('Client already have a driver')
         }

         await this.gatway.sendNotificationToDriver(
            driverProfileId,
            EVENT_ASSIGN_RIDE_TO_DRIVER,
            rideData,
         )

         return rideData
      } catch (error) {
         throw error
      }
   }
}
