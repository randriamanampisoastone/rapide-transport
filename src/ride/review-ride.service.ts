import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ReviewRideDto } from './dto/review-ride.dto'

@Injectable()
export class ReviewRideService {
   constructor(private readonly prismaService: PrismaService) {}

   addRideReview(
      rideId: string,
      clientProfileId: string,
      reviewRideDto: ReviewRideDto,
   ) {
      try {
         const ride = this.prismaService.ride.update({
            where: {
               rideId,
               clientProfileId,
            },
            data: {
               ...reviewRideDto,
            },
         })
         return ride
      } catch (error) {
         throw error
      }
   }
}
