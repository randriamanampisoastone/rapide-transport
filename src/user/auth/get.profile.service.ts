import { Injectable } from '@nestjs/common'
// import { RideStatus } from 'enums/ride.enum'

import { PrismaService } from 'src/prisma/prisma.service'
import { GetByStatusService } from 'src/ride/get-by-status.service'

@Injectable()
export class GetProfileService {
   constructor(
      private readonly prismaService: PrismaService,
      // private readonly getByStatusService: GetByStatusService,
   ) {}

   async getClientProfile(clientProfileId: string) {
      try {
         const clientProfile = await this.prismaService.profile.findUnique({
            where: { sub: clientProfileId },
            include: {
               clientProfile: true,
            },
         })
         const updateDriverProfile = {
            clientProfileId: clientProfile.clientProfile.clientProfileId,
            firstName: clientProfile.firstName,
            lastName: clientProfile.lastName,
            birthday: clientProfile.birthday,
            gender: clientProfile.gender,
            phoneNumber: clientProfile.phoneNumber,
            profilePhoto: clientProfile.profilePhoto,
            role: clientProfile.role,
            status: clientProfile.clientProfile.status,
         }

         return updateDriverProfile
      } catch (error) {
         throw error
      }
   }
   async getFullClientProfile(clientProfileId: string) {
      try {
         const clientProfile = await this.prismaService.profile.findUnique({
            where: { sub: clientProfileId },
            include: {
               clientProfile: true,
            },
         })
         return clientProfile
      } catch (error) {
         throw error
      }
   }
   async getClients(page: number, pageSize: number) {
      try {
         const select = {
            status: true,
            profile: {
               select: {
                  sub: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
               },
            },
            accountBalance: {
               select: {
                  balance: true,
                  balanceStatus: true,
               },
            },
         }

         const [clientProfiles, totalCount] = await Promise.all([
            await this.prismaService.clientProfile.findMany({
               select,
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            this.prismaService.clientProfile.count(),
         ])

         return {
            data: clientProfiles,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw error
      }
   }
   async getDriverProfile(driverProfileId: string) {
      try {
         const driverProfile = await this.prismaService.profile.findUnique({
            where: { sub: driverProfileId },
            include: {
               driverProfile: true,
            },
         })
         const updateDriverProfile = {
            driverProfileId: driverProfile.driverProfile.driverProfileId,
            firstName: driverProfile.firstName,
            lastName: driverProfile.lastName,
            birthday: driverProfile.birthday,
            gender: driverProfile.gender,
            phoneNumber: driverProfile.phoneNumber,
            profilePhoto: driverProfile.profilePhoto,
            role: driverProfile.role,
            status: driverProfile.driverProfile.status,
         }
         return updateDriverProfile
      } catch (error) {
         throw error
      }
   }
   async getDrivers(page: number, pageSize: number) {
      try {
         const select = {
            status: true,
            profile: {
               select: {
                  sub: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
               },
            },
            accountBalance: {
               select: {
                  balance: true,
                  balanceStatus: true,
               },
            },
         }

         const [driverProfiles, totalCount] = await Promise.all([
            await this.prismaService.driverProfile.findMany({
               select,
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            this.prismaService.driverProfile.count(),
         ])

         return {
            data: driverProfiles,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw error
      }
   }
   async getFullDriverProfile(driverProfileId: string) {
      try {
         const clientProfile = await this.prismaService.profile.findUnique({
            where: { sub: driverProfileId },
            include: {
               driverProfile: true,
            },
         })
         return clientProfile
      } catch (error) {
         throw error
      }
   }
}
