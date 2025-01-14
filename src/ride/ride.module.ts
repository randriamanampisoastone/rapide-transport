import { Module } from '@nestjs/common'
import { RideController } from './ride.controller'
import { CreateItineraryService } from './create-itinerary.service'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { RideModel } from './Model/ride.model'
import { CreateRideService } from './create-ride.service'
import { FindDriverService } from './find-driver.service'
import { GatewayModule } from 'src/gateway/gatway.module'
import { AcceptRideService } from './accept-driver.service'
import { StartRideService } from './start-ride.service'
import { CalculatePriceService } from './calculate-price.service'
import { CancelRideService } from './cancel-ride.service'
import { ComplitRideService } from './complit-ride.service'
import { ClientRideStatusService } from './client-ride-status.service'
import { LocationService } from 'src/gateway/location/location.service'
import { LocationModel } from 'src/gateway/location/Model/location.model'

@Module({
   imports: [
      DynamooseModule.forFeature([LocationModel, RideModel]),
      GatewayModule,
   ],
   controllers: [RideController],
   providers: [
      CreateItineraryService,
      CreateRideService,
      AcceptRideService,
      FindDriverService,
      RedisService,
      StartRideService,
      LocationService,
      CalculatePriceService,
      CancelRideService,
      ComplitRideService,
      ClientRideStatusService,
      CalculatePriceService,
   ],
})
export class RideModule {}
