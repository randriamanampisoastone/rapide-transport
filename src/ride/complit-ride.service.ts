import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'

@Injectable()
export class ComplitRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}
   complitRide(rideId: string) {
      return this.rideModel.update({ rideId }, { status: RideStatus.COMPLETED })
   }
}
