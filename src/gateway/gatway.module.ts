import { Module } from '@nestjs/common'
import { Gateway } from './gateway'
import { GeolocationService } from './geolocation/geolocation.service'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { GeolocationModel } from './geolocation/Model/geolocation.model'
import { CognitoWebSocketService } from 'src/cognito/cognito.websocket.service'
import { LocationService } from 'src/location/location.service'
import { CancelRideService } from 'src/ride/cancel-ride.service'
import { ComplitRideService } from 'src/ride/complit-ride.service'
import { ClientRideStatusService } from 'src/ride/client-ride-status.service'
import { RideModel } from 'src/ride/Model/ride.model'
import { CalculatePriceService } from 'src/ride/calculate-price.service'

@Module({
   imports: [
      //   CognitoWebSocketModule,
      DynamooseModule.forFeature([GeolocationModel, RideModel]),
   ],
   providers: [
      Gateway,
      CognitoWebSocketService,
      GeolocationService,
      RedisService,
      LocationService,
      CancelRideService,
      ComplitRideService,
      ClientRideStatusService,
      CalculatePriceService
   ],
   exports: [Gateway],
})
export class GatewayModule {}
