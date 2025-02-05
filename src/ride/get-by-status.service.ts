import { Injectable } from '@nestjs/common'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'

@Injectable()
export class GetByStatusService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}
   async getByStatus(status: RideStatus) {
      try {
         const rides = await this.rideModel.scan('status').eq(status).exec()
         return {
            data: rides,
            count: rides.count,
         }
      } catch (error) {
         throw error
      }
   }
}
