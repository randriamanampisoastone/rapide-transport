/* eslint-disable @typescript-eslint/no-unused-vars */
import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { EVENT_ACCEPTED_RIDE } from 'constants/event.constant'
import { parseRideData } from 'utils/rideDataParser.util'
import { NotificationService } from 'src/notification/notification.service'
import {
   ERROR_RIDE_NOT_FINDING_DRIVER,
   ERROR_RIDE_NOT_FOUND,
} from 'constants/error.constant'

export interface DriverAcceptDto {
   driverProfileId: string
   plateNumber: string
   rideId: string
}

@Injectable()
export class DriverAcceptService {
   constructor(
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly postgresService: PrismaService,
      private readonly notificationService: NotificationService,
   ) {}

   async driverAccept(driverAcceptDto: DriverAcceptDto) {
      try {
         const { rideId, driverProfileId, plateNumber } = driverAcceptDto

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)
         if (!ride) throw new NotFoundException(ERROR_RIDE_NOT_FOUND)

         const rideData: RideData = JSON.parse(ride)
         if (rideData.status !== RideStatus.FINDING_DRIVER)
            throw new BadRequestException(ERROR_RIDE_NOT_FINDING_DRIVER)

         rideData.status = RideStatus.DRIVER_ACCEPTED
         rideData.driverProfileId = driverProfileId
         rideData.plateNumber = plateNumber

         const rideDataString = JSON.stringify(rideData)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataString,
            1800,
         )
         const rideDataUpdatedOnDb = await this.postgresService.ride.update({
            where: {
               rideId,
            },
            include: {
               clientProfile: {
                  include: {
                     profile: true,
                  },
               },
               driverProfile: {
                  include: {
                     profile: true,
                  },
               },
            },
            data: {
               driverProfileId,
               status: RideStatus.DRIVER_ACCEPTED,
            },
         })
         const { clientProfileId } = rideData

         await this.notificationService.sendNotificationPushClient(
            clientProfileId,
            'Driver accepted !',
            'Your driver has accepted your ride',
         )

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_ACCEPTED_RIDE,
            rideData,
         )

         this.gateway.sendNotificationToAdmin(EVENT_ACCEPTED_RIDE, {
            ...parseRideData(rideDataUpdatedOnDb),
         })

         return rideData
      } catch (error) {
         throw error
      }
   }
}
