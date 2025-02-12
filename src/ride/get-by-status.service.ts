import { Injectable } from '@nestjs/common'
import { RideStatus } from 'enums/ride.enum'
import { PrismaService } from 'src/prisma/prisma.service'

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
            data: rides,
            count: rides.length,
         }
      } catch (error) {
         throw error
      }
   }
}
