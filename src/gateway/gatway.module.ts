import { Module } from '@nestjs/common'
import { Gateway } from './gateway'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { CognitoWebSocketService } from 'src/cognito/cognito.websocket.service'

import { RideModel } from 'src/ride/Model/ride.model'

import { LocationModel } from './location/Model/location.model'
import { LocationService } from './location/location.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CognitoWebSocketModule } from 'src/cognito/cognito.websocket.module'
import { CheckRideService } from 'src/ride/check-ride.service'

@Module({
   imports: [
      CognitoWebSocketModule,
      DynamooseModule.forFeature([LocationModel, RideModel]),
   ],
   providers: [
      Gateway,
      CognitoWebSocketService,
      LocationService,
      RedisService,
      LocationService,
      InfoOnRideService,
      CheckRideService,
   ],
   exports: [Gateway],
})
export class GatewayModule {}
