import { Module } from '@nestjs/common'
import { Gateway } from './gateway'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { CognitoWebSocketService } from 'src/cognito/cognito.websocket.service'
import { CancelRideService } from 'src/ride/cancel-ride.service'
import { ComplitRideService } from 'src/ride/complit-ride.service'
import { ClientRideStatusService } from 'src/ride/client-ride-status.service'
import { RideModel } from 'src/ride/Model/ride.model'
import { CalculatePriceService } from 'src/ride/calculate-price.service'
import { LocationModel } from './location/Model/location.model'
import { LocationService } from './location/location.service'

@Module({
   imports: [
      //   CognitoWebSocketModule,
      DynamooseModule.forFeature([LocationModel, RideModel]),
   ],
   providers: [
      Gateway,
      CognitoWebSocketService,
      LocationService,
      RedisService,
      LocationService,
      CancelRideService,
      ComplitRideService,
      ClientRideStatusService,
      CalculatePriceService,
   ],
   exports: [Gateway],
})
export class GatewayModule {}
