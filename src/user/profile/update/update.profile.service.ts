import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { UpdateClientProfileDto } from './dto/update-client-profile.dto'
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto'
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto'
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto'
@Injectable()
export class UpdateProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async updateClientProfile(
      clientProfileId: string,
      updateClientProfileDto: UpdateClientProfileDto,
   ) {
      try {
         return await this.prismaService.clientProfile.update({
            where: { clientProfileId },
            data: updateClientProfileDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async updateProviderProfile(
      providerProfileId: string,
      updateProviderProfileDto: UpdateProviderProfileDto,
   ) {
      try {
         return await this.prismaService.providerProfile.update({
            where: { providerProfileId },
            data: updateProviderProfileDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async updateDriverProfile(
      driverProfileId: string,
      updateDriverProfileDto: UpdateDriverProfileDto,
   ) {
      try {
         return await this.prismaService.driverProfile.update({
            where: { driverProfileId },
            data: updateDriverProfileDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async updateAdminProfile(
      adminProfileId: string,
      updateAdminProfileDto: UpdateAdminProfileDto,
   ) {
      try {
         return await this.prismaService.adminProfile.update({
            where: { adminProfileId },
            data: updateAdminProfileDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
