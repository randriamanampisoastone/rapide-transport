import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GetProfileService {
   constructor(private readonly prismaService: PrismaService) {}

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
}
