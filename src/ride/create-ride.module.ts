import { Module } from '@nestjs/common'
import { CreateRideController } from './create-ride.controller'
import { CreateItineraryService } from './create-itinerary.service'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { RideModel } from './Model/ride.model'
import { CreateRideService } from './create-ride.service'
import { FindDriverService } from './find-driver.service'

import { GatewayModule } from 'src/gateway/gatway.module'

@Module({
   imports: [DynamooseModule.forFeature([RideModel]), GatewayModule],
   controllers: [CreateRideController],
   providers: [
      CreateItineraryService,
      CreateRideService,
      FindDriverService,
      RedisService,
   ],
})
export class CreateRideModule {}
