import { Module } from '@nestjs/common'
import { Gateway } from './gateway'
import { GeolocationService } from './geolocation/geolocation.service'
import { RedisService } from 'src/redis/redis.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { GeolocationModel } from './geolocation/Model/geolocation.model'
import { CognitoWebSocketService } from 'src/cognito/cognito.websocket.service'

@Module({
   imports: [
      //   CognitoWebSocketModule,
      DynamooseModule.forFeature([GeolocationModel]),
   ],
   providers: [
      Gateway,
      CognitoWebSocketService,
      GeolocationService,
      RedisService,
   ],
   exports: [Gateway],
})
export class GatewayModule {}
