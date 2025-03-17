import { Injectable } from '@nestjs/common'
import { UserRole } from 'enums/profile.enum'
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
                     rapideWallet: {
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
            balance: clientProfile.clientProfile.rapideWallet.balance,
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
                     rapideWallet: {
                        select: {
                           balance: true,
                        },
                     },
                     completeRide: true,
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
            balance: driverProfile.driverProfile.rapideWallet.balance,
            completeRide: driverProfile.driverProfile.completeRide,
         }
      } catch (error) {
         throw error
      }
   }
   async getAdminProfile(sub: string) {
      try {
         const adminProfile = await this.prismaService.profile.findUnique({
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
                     transactionPassword: true,
                  },
               },
            },
         })
         return {
            adminProfileId: adminProfile.sub,
            phoneNumber: adminProfile.phoneNumber,
            email: adminProfile.email,
            firstName: adminProfile.firstName,
            lastName: adminProfile.lastName,
            birthday: adminProfile.birthday,
            gender: adminProfile.gender,
            profilePhoto: adminProfile.profilePhoto,
            role: adminProfile.role,
            status: adminProfile.adminProfile.status,
            transactionPassword: adminProfile.adminProfile.transactionPassword,
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
                     rapideWallet: true,
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
                  profilePhoto: true,
               },
            },
            rapideWallet: true,
            completeRide: true,
            cancelledRide: true,
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
            rapideWallet: true,
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

   async getDriverByIds(driverProfileIds: string[]) {
      try {
         const condition = driverProfileIds.length
            ? { driverProfileId: { in: driverProfileIds } }
            : {}
         const driverProfiles = await this.prismaService.driverProfile.findMany(
            {
               where: condition,
               include: {
                  profile: true,
               },
            },
         )

         return driverProfiles
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
                  profilePhoto: true,
               },
            },
            rapideWallet: true,
            completeRide: true,
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
            rapideWallet: true,
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
                     rapideWallet: true,
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

   async getAdmins(page: number, pageSize: number) {
      try {
         const [data, totalCount] = await Promise.all([
            await this.prismaService.adminProfile.findMany({
               where: { profile: { role: { not: UserRole.SUPER_ADMIN } } },
               include: { profile: true },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.adminProfile.count(),
         ])
         return {
            data,
            hasMore: page * pageSize < totalCount,
            totalCount,
         }
      } catch (error) {
         throw error
      }
   }
}
