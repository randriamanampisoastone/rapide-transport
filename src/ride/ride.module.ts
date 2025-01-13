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
import { LocationService } from 'src/location/location.service'

@Module({
   imports: [DynamooseModule.forFeature([RideModel]), GatewayModule],
   controllers: [RideController],
   providers: [
      CreateItineraryService,
      CreateRideService,
      AcceptRideService,
      FindDriverService,
      RedisService,
      StartRideService,
      LocationService
   ],
})
export class RideModule {}
