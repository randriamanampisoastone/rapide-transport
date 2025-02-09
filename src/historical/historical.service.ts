import { Injectable } from '@nestjs/common'
import { profile } from 'console'
import { RideStatus } from 'enums/ride.enum'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class HistoricalService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly prismaService: PrismaService,
   ) {}

   async getAllHistorical(status: RideStatus, page: number, pageSize: number) {
      try {
         const condition = status ? { status } : {}
         const [rides, totalCount] = await Promise.all([
            await this.prismaService.ride.findMany({
               where: condition,
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
               },
               take: pageSize,
               skip: (page - 1) * pageSize,
            }),
            await this.prismaService.ride.count({ where: condition }),
         ])
         return {
            data: rides,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw error
      }
   }

   async getClientHistorical(
      clientProfileId: string,
      status: RideStatus,
      page: number,
      pageSize: number,
   ) {
      try {
         const condition = status ? { status } : {}
         const [rides, totalCount] = await Promise.all([
            await this.prismaService.ride.findMany({
               where: {
                  AND: [{ clientProfileId }, condition],
               },
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
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.ride.count({
               where: { AND: [{ clientProfileId }, condition] },
            }),
         ])
         return {
            data: rides,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw error
      }
   }

   async getDriverHistorical(
      driverProfileId: string,
      status: RideStatus,
      page: number,
      pageSize: number,
   ) {
      try {
         const condition = status ? { status } : {}
         const [rides, totalCount] = await Promise.all([
            await this.prismaService.ride.findMany({
               where: {
                  AND: [{ driverProfileId }, condition],
               },
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
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.ride.count({
               where: { AND: [{ driverProfileId }, condition] },
            }),
         ])
         return {
            data: rides,
            hasMore: page * pageSize < totalCount,
            totalCount: totalCount,
         }
      } catch (error) {
         throw error
      }
   }
}
