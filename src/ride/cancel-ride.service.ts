import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'

@Injectable()
export class CancelRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}
   cancelRide(rideId: string) {
      return this.rideModel.update({ rideId }, { status: RideStatus.CANCELLED })
   }
}
