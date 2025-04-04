import { Injectable } from '@nestjs/common'
import { MethodType, TransactionStatus, UserRole } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GetTransactionService {
   constructor(private readonly prismaService: PrismaService) {}

   async getAllTransactions(
      method: MethodType,
      status: TransactionStatus,
      page: number,
      pageSize: number,
   ) {
      try {
         const method_condition = method ? { method } : {}
         const status_condition = status ? { status } : {}
         const profileSelection = {
            select: {
               profile: {
                  select: {
                     sub: true,
                     firstName: true,
                     lastName: true,
                     phoneNumber: true,
                     profilePhoto: true,
                  },
               },
            },
         }
         const [data, totalCount] = await Promise.all([
            await this.prismaService.transaction.findMany({
               where: { AND: [method_condition, status_condition] },
               orderBy: {
                  createdAt: 'desc',
               },
               include: {
                  clientProfiles: profileSelection,
                  driverProfile: profileSelection,
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.transaction.count({
               where: { AND: [method_condition, status_condition] },
            }),
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

   async getUserTransactoins(
      profileId: string,
      method: MethodType,
      status: TransactionStatus,
      page: number,
      pageSize: number,
   ) {
      try {
         const method_condition = method ? { method } : {}
         const status_condition = status ? { status } : {}
         const [data, totalCount] = await Promise.all([
            await this.prismaService.transaction.findMany({
               where: {
                  OR: [{ from: profileId }, { to: profileId }],
                  AND: [method_condition, status_condition],
               },
               orderBy: {
                  createdAt: 'desc',
               },
               include: {
                  clientProfiles: {
                     include: {
                        profile: true,
                     },
                  },
                  driverProfile: {
                     include: {
                        profile: true,
                     },
                  },
               },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.transaction.count({
               where: {
                  OR: [{ from: profileId }, { to: profileId }],
                  AND: [method_condition, status_condition],
               },
            }),
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

   async getTransactionByReferance(profileId: string, reference: number) {
      try {
         return await this.prismaService.transaction.findMany({
            where: {
               AND: [
                  { OR: [{ from: profileId }, { to: profileId }] },
                  { reference },
               ],
            },
            include: {
               clientProfiles: {
                  include: {
                     profile: true,
                  },
               },
               driverProfile: {
                  include: {
                     profile: true,
                  },
               },
            },
         })
      } catch (error) {
         throw error
      }
   }

   async searchTransactionByReference(reference: number) {
      try {
         const profileSelection = {
            select: {
               profile: {
                  select: {
                     sub: true,
                     firstName: true,
                     lastName: true,
                     phoneNumber: true,
                     profilePhoto: true,
                  },
               },
            },
         }
         return await this.prismaService.transaction.findUnique({
            where: { reference },
            include: {
               clientProfiles: profileSelection,
               driverProfile: profileSelection,
            },
         })
      } catch (error) {
         throw error
      }
   }
}
