import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { GenderType, ProfileStatus } from '@prisma/client'

@Injectable()
export class FindDriverProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async findProfileById(sub: string) {
      try {
         const driverProfile =
            await this.prismaService.driverProfile.findUnique({
               where: { driverProfileId: sub },
            })

         return driverProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async findProfiles(page: number, pageSize: number) {
      try {
         const driverProfile = await this.prismaService.driverProfile.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return driverProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async findProfilesByGender(
      gender: GenderType,
      page: number,
      pageSize: number,
   ) {
      try {
         const driverProfile = await this.prismaService.driverProfile.findMany({
            where: { gender },
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return driverProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async findProfilesByStatus(
      status: ProfileStatus,
      page: number,
      pageSize: number,
   ) {
      try {
         const driverProfile = await this.prismaService.driverProfile.findMany({
            where: { status },
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return driverProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async findProfilesBySearchTerm(
      searchTerm: string,
      page: number,
      pageSize: number,
   ) {
      try {
         const driverProfile = await this.prismaService.driverProfile.findMany({
            where: {
               OR: [
                  { email: { contains: searchTerm, mode: 'insensitive' } },
                  { firstName: { contains: searchTerm, mode: 'insensitive' } },
                  { lastName: { contains: searchTerm, mode: 'insensitive' } },
               ],
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return driverProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async getStatistics() {
      const totalProfiles = await this.prismaService.driverProfile.count()

      const profilesByGender = await this.prismaService.driverProfile.groupBy({
         by: ['gender'],
         _count: {
            gender: true,
         },
      })

      const profilesByStatus = await this.prismaService.driverProfile.groupBy({
         by: ['status'],
         _count: {
            status: true,
         },
      })

      return {
         totalProfiles,
         profilesByGender,
         profilesByStatus,
      }
   }
}
