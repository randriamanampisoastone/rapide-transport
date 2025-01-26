import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'

export interface ReviewDto {
   note: number
   clientProfileId: string
   review: string
   rideId: string
}

@Injectable()
export class ReviewService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
   ) {}
   async review(reviewDto: ReviewDto) {
      try {
         const clientProfileId = reviewDto.clientProfileId
         const rideId = reviewDto.rideId

         const ride = await this.rideModel.get({ rideId })

         if (ride.clientProfileId !== clientProfileId) {
            throw new Error('Client is not the client of the ride')
         }

         await this.rideModel.update(
            {
               rideId,
            },
            {
               note: reviewDto.note,
               review: reviewDto.review,
            },
         )
      } catch (error) {
         throw error
      }
   }
}
