import {
   BadRequestException,
   ForbiddenException,
   Injectable,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { parseRideData } from 'utils/rideDataParser.util'

export interface ReviewDto {
   note: number
   clientProfileId: string
   review: string
   rideId: string
}

@Injectable()
export class ReviewService {
   constructor(private readonly prismaService: PrismaService) {}
   async review(reviewDto: ReviewDto) {
      try {
         const clientProfileId = reviewDto.clientProfileId
         const rideId = reviewDto.rideId

         const ride = parseRideData(
            await this.prismaService.ride.findUnique({
               where: { rideId },
            }),
         )

         if (ride.clientProfileId !== clientProfileId) {
            // throw new Error('Client is not the client of the ride')
            throw new ForbiddenException('Client is not the client of the ride')
         }

         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               note: reviewDto.note,
               review: reviewDto.review,
            },
         })
      } catch (error) {
         // throw error
         throw new BadRequestException('Error adding review')
      }
   }
}
