import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { RedisService } from 'src/redis/redis.service'

interface StartRideDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class StartRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private redisService: RedisService,
   ) {}
   startRide(startRideDto: StartRideDto) {
      return this.rideModel.update(
         { rideId: startRideDto.rideId },
         {
            driverProfileId: startRideDto.driverProfileId,
            status: RideStatus.ON_RIDE,
         },
      )
   }
}
