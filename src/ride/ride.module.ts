import { Module } from '@nestjs/common'
import { RideController } from './ride.controller'
import { CreateItineraryService } from './create-itinerary.service'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { RideModel } from './Model/ride.model'
import { CreateRideService } from './create-ride.service'
import { FindDriverService } from './find-driver.service'
import { GatewayModule } from 'src/gateway/gatway.module'
import { LocationService } from 'src/gateway/location/location.service'
import { LocationModel } from 'src/gateway/location/Model/location.model'
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

@Module({
   imports: [
      DynamooseModule.forFeature([LocationModel, RideModel]),
      GatewayModule,
   ],
   controllers: [RideController],
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
   ],
})
export class RideModule {}
