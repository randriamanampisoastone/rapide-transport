import { Module } from '@nestjs/common'
import { RideController } from './ride.controller'
import { CreateItineraryService } from './create-itinerary.service'
import { RedisService } from 'src/redis/redis.service'
import { CreateRideService } from './create-ride.service'
import { FindDriverService } from './find-driver.service'
import { GatewayModule } from 'src/gateway/gatway.module'
import { LocationService } from 'src/gateway/location/location.service'
import { DriverAcceptService } from './driver-accept.service'
import { CancelledService } from './cancelled.service'
import { DriverOnTheWayService } from './driver-on-the-way.service'
import { DriverArrivedService } from './driver-arrived.service'
import { ClientNotFoundService } from './client-not-found.service'
import { StartService } from './start.service'
import { ClientGiveUpService } from './client-give-up.service'
import { ArrivedDestinationService } from './arrived-destination.service'
import { CompleteService } from './complete.service'
import { ReviewService } from './review.service'
import { GetRideService } from './get-ride.service'
import { StoppedService } from './stopped.service'
import { DriverBalanceService } from 'src/rapideWallet/driverBalance.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { InfoOnRideService } from './info-on-ride.service'
import { GetRideInvoiceService } from './get-ride-invoice.service'
import { RideInvoiceController } from './ride-invoice.controller'
import { CheckRideService } from './check-ride.service'
import { AssignRideToDriverService } from './assign-ride-to-driver.service'
import { ReviewRideService } from './review-ride.service'
import { DeleteRideService } from './delete-ride.service'
import { NotificationModule } from 'src/notification/notification.module'
import { NotificationService } from 'src/notification/notification.service'
import { RidePaymentService } from 'src/payment/ride-payment/ride-payment.service'
import { SmsService } from 'src/sms/sms.service'

@Module({
   imports: [GatewayModule, NotificationModule],
   controllers: [RideController, RideInvoiceController],
   providers: [
      RedisService,
      LocationService,
      GetRideService,

      CreateItineraryService,
      CreateRideService,
      FindDriverService,
      CancelledService,
      DriverAcceptService,
      DriverOnTheWayService,
      StoppedService,
      DriverArrivedService,
      ClientNotFoundService,
      StartService,
      ClientGiveUpService,
      ArrivedDestinationService,
      CompleteService,
      ReviewService,
      CheckRideService,

      DriverBalanceService,
      PrismaService,
      InfoOnRideService,

      GetRideInvoiceService,

      AssignRideToDriverService,
      ReviewRideService,

      DeleteRideService,

      NotificationService,

      //For payment
      RidePaymentService,
      SmsService,
   ],
})
export class RideModule {}
