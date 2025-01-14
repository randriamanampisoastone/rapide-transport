import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'

@Injectable()
export class ClientRideStatusService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}
   clientGiveUpRide(rideId: string) {
      return this.rideModel.update(
         { rideId },
         { status: RideStatus.CLIENT_GIVE_UP },
      )
   }
   clientNotFoundRide(rideId: string) {
      return this.rideModel.update(
         { rideId },
         { status: RideStatus.CLIENT_NOT_FOUND },
      )
   }
}
