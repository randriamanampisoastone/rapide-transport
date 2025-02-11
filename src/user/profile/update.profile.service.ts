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
         await this.prismaService.profile.update({
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
         await this.prismaService.clientProfile.update({
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
         await this.prismaService.driverProfile.update({
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
}
