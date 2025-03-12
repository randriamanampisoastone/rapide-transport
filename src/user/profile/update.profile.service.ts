import { Injectable } from '@nestjs/common'
import { UserRole } from 'enums/profile.enum'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdateProfileDto } from './dto/update.profile.dto'
import { ProfileStatus } from '@prisma/client'

@Injectable()
export class UpdateProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async updateProfile(sub: string, updateProfileDto: UpdateProfileDto) {
      try {
         return await this.prismaService.profile.update({
            where: {
               sub: sub,
               role: { in: [UserRole.CLIENT, UserRole.DRIVER] },
            },
            data: {
               ...updateProfileDto,
            },
         })
      } catch (error) {
         throw error
      }
   }

   async updateClientStatus(clientProfileId: string, status: ProfileStatus) {
      try {
         return await this.prismaService.clientProfile.update({
            where: {
               clientProfileId,
            },
            data: {
               status,
            },
         })
      } catch (error) {
         throw error
      }
   }

   async updateDriverStatus(driverProfileId: string, status: ProfileStatus) {
      try {
         return await this.prismaService.driverProfile.update({
            where: {
               driverProfileId,
            },
            data: {
               status,
            },
         })
      } catch (error) {
         throw error
      }
   }

   async updateAdminStatus(adminProfileId: string, status: ProfileStatus) {
      try {
         return await this.prismaService.adminProfile.update({
            where: { adminProfileId },
            data: { status },
         })
      } catch (error) {
         throw error
      }
   }

   async updateAdminRole(adminProfileId: string, role: UserRole) {
      try {
         return await this.prismaService.profile.update({
            where: { sub: adminProfileId },
            data: { role },
         })
      } catch (error) {
         throw error
      }
   }
}
