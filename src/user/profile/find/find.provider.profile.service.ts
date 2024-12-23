import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { EnterpriseType, ProfileStatus } from '@prisma/client'

@Injectable()
export class FindProviderProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async findProfileById(sub: string) {
      try {
         const providerProfile =
            await this.prismaService.providerProfile.findUnique({
               where: { providerProfileId: sub },
            })

         return providerProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async findProfiles(page: number, pageSize: number) {
      try {
         const providerProfile =
            await this.prismaService.providerProfile.findMany({
               skip: (page - 1) * pageSize,
               take: pageSize,
            })

         return providerProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async findProfilesByType(
      enterpriseTypeTerm: EnterpriseType,
      page: number,
      pageSize: number,
   ) {
      try {
         const providerProfile =
            await this.prismaService.providerProfile.findMany({
               where: { enterpriseType: { equals: enterpriseTypeTerm } },
               skip: (page - 1) * pageSize,
               take: pageSize,
            })

         return providerProfile
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
         const providerProfile =
            await this.prismaService.providerProfile.findMany({
               where: { status },
               skip: (page - 1) * pageSize,
               take: pageSize,
            })

         return providerProfile
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
         const providerProfile =
            await this.prismaService.providerProfile.findMany({
               where: {
                  OR: [
                     { email: { contains: searchTerm, mode: 'insensitive' } },
                     {
                        enterpriseName: {
                           contains: searchTerm,
                           mode: 'insensitive',
                        },
                     },
                  ],
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            })

         return providerProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
   async getStatistics() {
      const totalProfiles = await this.prismaService.providerProfile.count()

      const profilesByGender = await this.prismaService.providerProfile.groupBy(
         {
            by: ['enterpriseType'],
            _count: {
               enterpriseType: true,
            },
         },
      )

      const profilesByStatus = await this.prismaService.providerProfile.groupBy(
         {
            by: ['status'],
            _count: {
               status: true,
            },
         },
      )

      return {
         totalProfiles,
         profilesByGender,
         profilesByStatus,
      }
   }
}
