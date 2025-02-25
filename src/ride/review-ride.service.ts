import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
@Injectable()
export class ReviewRideService {
   constructor(private readonly prismaService: PrismaService) {}

   async addRideReview(
      rideId: string,
      clientProfileId: string,
      note: number,
      review: string,
   ) {
      try {
         const ride = await this.prismaService.ride.update({
            where: {
               rideId,
               clientProfileId,
            },
            data: {
               note,
               review,
            },
         })
         return ride
      } catch (error) {
         throw error
      }
   }
}
