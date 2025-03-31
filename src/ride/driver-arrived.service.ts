import {
   BadRequestException,
   ForbiddenException,
   HttpException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { EVENT_DRIVER_ARREIVED } from 'constants/event.constant'
import { NotificationService } from 'src/notification/notification.service'
import { RidePaymentService } from 'src/payment/ride-payment/ride-payment.service'
import { MethodType } from '@prisma/client'
import { UserRole } from 'enums/profile.enum'

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
      private readonly notificationService: NotificationService,
      private readonly ridePaymentService: RidePaymentService,
   ) {}

   async drivertArrived(driverArrivedDto: DriverArrivedDto) {
      try {
         const rideId = driverArrivedDto.rideId
         const driverProfileId = driverArrivedDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.DRIVER_ON_THE_WAY) {
            // throw new Error('Ride is not in DRIVER_ON_THE_WAY status')
            throw new BadRequestException(
               'Ride is not in DRIVER_ON_THE_WAY status',
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

         await this.notificationService.sendNotificationPushClient(
            clientProfileId,
            'Driver arrived !',
            'Your driver has arrived',
         )

         if (rideData.methodType === MethodType.RAPIDE_WALLET) {
            const rideTtl = await this.redisService.ttl(
               `${RIDE_PREFIX + rideId}`,
            )
            await this.ridePaymentService.setReceiverAndTtl(
               rideData.clientProfileId,
               driverProfileId,
               rideTtl,
            )
         }

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_DRIVER_ARREIVED,
            {},
         )
         this.gateway.sendNotificationToAdmin(
            [UserRole.RIDER, UserRole.CALL_CENTER, UserRole.MANAGER_HUB],
            EVENT_DRIVER_ARREIVED,
            {
               ...rideDataUpdated,
            },
         )
      } catch (error) {
         // throw error
         throw new HttpException(error.message, error.status)
      }
   }
}
