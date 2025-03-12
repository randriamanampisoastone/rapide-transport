import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GetRideInvoiceService {
   constructor(private readonly prismaService: PrismaService) {}

   async getInvoices(page: number, pageSize: number) {
      try {
         const [rides, totalCount] = await Promise.all([
            await this.prismaService.rideInvoice.findMany({
               orderBy: {
                  createdAt: 'desc',
               },
               include: {
                  clientProfile: {
                     include: {
                        profile: true,
                     },
                  },
                  driverProfile: {
                     include: {
                        profile: true,
                     },
                  },
                  paymentTransactions: true,
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.rideInvoice.count(),
         ])
         return {
            data: rides,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw new NotFoundException('No rides found')
      }
   }

   async getClientInvoices(
      clientProfileId: string,
      page: number,
      pageSize: number,
   ) {
      try {
         const [rides, totalCount] = await Promise.all([
            await this.prismaService.rideInvoice.findMany({
               where: {
                  clientProfileId: clientProfileId,
               },
               include: {
                  clientProfile: {
                     include: {
                        profile: true,
                     },
                  },
                  driverProfile: {
                     include: {
                        profile: true,
                     },
                  },
               },
               orderBy: {
                  createdAt: 'desc',
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.rideInvoice.count(),
         ])
         return {
            data: rides,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw new NotFoundException('No rides found')
      }
   }
}
