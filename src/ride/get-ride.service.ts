import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'

@Injectable()
export class GetRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}

   async getRide(rideId: string) {
      return await this.rideModel.get({ rideId })
   }
}
