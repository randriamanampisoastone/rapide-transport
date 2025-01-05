import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { GenderType, ProfileStatus } from '@prisma/client'

@Injectable()
export class FindClientProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async findProfileById(sub: string) {
      try {
         const clientProfile =
            await this.prismaService.clientProfile.findUnique({
               where: { clientProfileId: sub },
            })
         return clientProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async findProfiles(page: number, pageSize: number) {
      try {
         const clientProfile = await this.prismaService.clientProfile.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return clientProfile
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
         const clientProfile = await this.prismaService.clientProfile.findMany({
            where: { gender },
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return clientProfile
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
         const clientProfile = await this.prismaService.clientProfile.findMany({
            where: { status },
            skip: (page - 1) * pageSize,
            take: pageSize,
         })

         return clientProfile
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
         const clientProfile = await this.prismaService.clientProfile.findMany({
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

         return clientProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async getStatistics() {
      const totalProfiles = await this.prismaService.clientProfile.count()

      const profilesByGender = await this.prismaService.clientProfile.groupBy({
         by: ['gender'],
         _count: {
            gender: true,
         },
      })

      const profilesByStatus = await this.prismaService.clientProfile.groupBy({
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
