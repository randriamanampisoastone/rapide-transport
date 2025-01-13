import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride'
import { InjectModel, Model } from 'nestjs-dynamoose'

interface StartRideDto {
   driverId: string
   rideId: string
}

@Injectable()
export class StartRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}
   startRide(startRideDto: StartRideDto) {
      return this.rideModel.update(
         { rideId: startRideDto.rideId },
         {
            driverId: startRideDto.driverId,
            status: RideStatus.ON_RIDE,
         },
      )
   }
}
