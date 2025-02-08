import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class GetProfileService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly redisService: RedisService,
      // private readonly getByStatusService: GetByStatusService,
   ) {}

   async getClientProfile(sub: string) {
      try {
         const clientProfile = await this.prismaService.profile.findUnique({
            where: { sub },
            select: {
               sub: true,
               phoneNumber: true,
               email: true,
               firstName: true,
               lastName: true,
               birthday: true,
               gender: true,
               profilePhoto: true,
               role: true,
               clientProfile: {
                  select: {
                     status: true,
                     accountBalance: {
                        select: {
                           balance: true,
                        },
                     },
                  },
               },
            },
         })
         return {
            clientProfileId: clientProfile.sub,
            phoneNumber: clientProfile.phoneNumber,
            email: clientProfile.email,
            firstName: clientProfile.firstName,
            lastName: clientProfile.lastName,
            birthday: clientProfile.birthday,
            gender: clientProfile.gender,
            profilePhoto: clientProfile.profilePhoto,
            role: clientProfile.role,
            status: clientProfile.clientProfile.status,
            balance: clientProfile.clientProfile.accountBalance.balance,
         }
      } catch (error) {
         throw error
      }
   }
   async getDriverProfile(sub: string) {
      try {
         const driverProfile = await this.prismaService.profile.findUnique({
            where: { sub },
            select: {
               sub: true,
               phoneNumber: true,
               email: true,
               firstName: true,
               lastName: true,
               birthday: true,
               gender: true,
               profilePhoto: true,
               role: true,
               driverProfile: {
                  select: {
                     status: true,
                     accountBalance: {
                        select: {
                           balance: true,
                        },
                     },
                  },
               },
            },
         })
         return {
            driverProfileId: driverProfile.sub,
            phoneNumber: driverProfile.phoneNumber,
            email: driverProfile.email,
            firstName: driverProfile.firstName,
            lastName: driverProfile.lastName,
            birthday: driverProfile.birthday,
            gender: driverProfile.gender,
            profilePhoto: driverProfile.profilePhoto,
            role: driverProfile.role,
            status: driverProfile.driverProfile.status,
            balance: driverProfile.driverProfile.accountBalance.balance,
         }
      } catch (error) {
         throw error
      }
   }
   async getAdminProfile(sub: string) {
      try {
         const driverProfile = await this.prismaService.profile.findUnique({
            where: { sub },
            select: {
               sub: true,
               phoneNumber: true,
               email: true,
               firstName: true,
               lastName: true,
               birthday: true,
               gender: true,
               profilePhoto: true,
               role: true,
               adminProfile: {
                  select: {
                     status: true,
                  },
               },
            },
         })
         return {
            adminProfileId: driverProfile.sub,
            phoneNumber: driverProfile.phoneNumber,
            email: driverProfile.email,
            firstName: driverProfile.firstName,
            lastName: driverProfile.lastName,
            birthday: driverProfile.birthday,
            gender: driverProfile.gender,
            profilePhoto: driverProfile.profilePhoto,
            role: driverProfile.role,
            status: driverProfile.adminProfile.status,
         }
      } catch (error) {
         throw error
      }
   }

   async getFullClientProfile(clientProfileId: string) {
      try {
         const clientProfile = await this.prismaService.profile.findUnique({
            where: { sub: clientProfileId },
            include: {
               clientProfile: {
                  include: {
                     accountBalance: true,
                     clientAddress: true,
                     profile: true,
                     rideInvoice: true,
                  },
               },
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
            accountBalance: true,
         }

         const [clientProfiles, totalCount, newClients] = await Promise.all([
            await this.prismaService.clientProfile.findMany({
               select,
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.clientProfile.count(),
            await this.redisService.getNewClients(),
         ])

         return {
            data: clientProfiles,
            newClients,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw error
      }
   }
   async searchClientByTerm(term: string, page: number, pageSize: number) {
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
            accountBalance: true,
         }

         const [data, totalCount, newClients] = await Promise.all([
            await this.prismaService.clientProfile.findMany({
               where: {
                  OR: [
                     {
                        profile: {
                           firstName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           lastName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           email: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           phoneNumber: { contains: term, mode: 'insensitive' },
                        },
                     },
                  ],
               },
               select,
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            this.prismaService.clientProfile.count({
               where: {
                  OR: [
                     {
                        profile: {
                           firstName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           lastName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           email: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           phoneNumber: { contains: term, mode: 'insensitive' },
                        },
                     },
                  ],
               },
            }),
            await this.redisService.getNewClients(),
         ])

         return term
            ? {
                 data,
                 newClients,
                 hasMore: page * pageSize < totalCount,
                 totalCount,
              }
            : {
                 data: [],
                 newClients,
                 hasMore: false,
                 totalCount: 0,
              }
      } catch (error) {
         throw error
      }
   }

   async getClientByIds(clientProfileIds: string[]) {
      try {
         const condition = clientProfileIds.length
            ? { clientProfileId: { in: clientProfileIds } }
            : {}
         const clientProfiles = await this.prismaService.clientProfile.findMany(
            {
               where: condition,
               include: {
                  profile: true,
               },
            },
         )

         return clientProfiles
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
            accountBalance: true,
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
   async searchDriverByTerm(term: string, page: number, pageSize: number) {
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
            accountBalance: true,
         }

         const [data, totalCount] = await Promise.all([
            await this.prismaService.driverProfile.findMany({
               where: {
                  OR: [
                     {
                        profile: {
                           firstName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           lastName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           email: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           phoneNumber: { contains: term, mode: 'insensitive' },
                        },
                     },
                  ],
               },
               select,
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.driverProfile.count({
               where: {
                  OR: [
                     {
                        profile: {
                           firstName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           lastName: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           email: { contains: term, mode: 'insensitive' },
                        },
                     },
                     {
                        profile: {
                           phoneNumber: { contains: term, mode: 'insensitive' },
                        },
                     },
                  ],
               },
            }),
         ])

         return term
            ? {
                 data,
                 hasMore: page * pageSize < totalCount,
                 totalCount,
              }
            : {
                 data: [],
                 hasMore: false,
                 totalCount: 0,
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
               driverProfile: {
                  include: {
                     accountBalance: true,
                     transaction: true,
                     profile: true,
                     rideInvoice: true,
                  },
               },
            },
         })
         return clientProfile
      } catch (error) {
         throw error
      }
   }
}
