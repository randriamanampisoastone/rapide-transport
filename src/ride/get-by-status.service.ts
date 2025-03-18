import { Injectable, NotFoundException } from '@nestjs/common'
import { RideStatus } from 'enums/ride.enum'
import { PrismaService } from 'src/prisma/prisma.service'
import { parseRideData } from 'utils/rideDataParser.util'

@Injectable()
export class GetByStatusService {
   constructor(private readonly prismaService: PrismaService) {}
   async getByStatus(status: RideStatus) {
      try {
         const rides = await this.prismaService.ride.findMany({
            where: {
               status,
            },
         })
         return {
            data: rides.map((item) => parseRideData(item)),
            count: rides.length,
         }
      } catch (error) {
         // throw error
         throw new NotFoundException(`No rides found with status: ${status}`)
      }
   }
}
