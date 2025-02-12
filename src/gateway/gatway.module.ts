import { Module } from '@nestjs/common'
import { Gateway } from './gateway'
import { RedisService } from 'src/redis/redis.service'
import { LocationService } from './location/location.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CheckRideService } from 'src/ride/check-ride.service'

@Module({
   imports: [],
   providers: [
      Gateway,
      LocationService,
      RedisService,
      LocationService,
      InfoOnRideService,
      CheckRideService,
   ],
   exports: [Gateway],
})
export class GatewayModule {}
