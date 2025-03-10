import { Injectable } from '@nestjs/common'
import { RequestFor } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class FindClientRequestService {
   constructor(private readonly prismaService: PrismaService) {}

   async getAllCientRequest(requestFor: RequestFor, page: number, pageSize: number) {
      try {
         const [clientRequests, totalCount] = await Promise.all([
            await this.prismaService.clientRequest.findMany({
               where: { responseFor: null, requestFor },
               include: { clientProfile: { include: { profile: true } } },
               orderBy: { createdAt: 'desc' },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.clientRequest.count(),
         ])

         return {
            data: clientRequests,
            hasMore: page * pageSize < totalCount,
            totalCount: totalCount,
         }
      } catch (error) {
         throw error
      }
   }

   async getRequests(clientRequestId: string, page: number, pageSize: number) {
      try {
         const [clientRequests, totalCount] = await Promise.all([
            await this.prismaService.clientRequest.findMany({
               where: {
                  OR: [{ responseFor: clientRequestId }, { clientRequestId }],
               },
               include: { clientProfile: { include: { profile: true } } },
               orderBy: { createdAt: 'desc' },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.clientRequest.count(),
         ])

         return {
            data: clientRequests,
            hasMore: page * pageSize < totalCount,
            totalCount: totalCount,
         }
      } catch (error) {
         throw error
      }
   }

   async getClientRequests(
      clientProfileId: string,
      page: number,
      pageSize: number,
   ) {
      try {
         const [clientRequests, totalCount] = await Promise.all([
            await this.prismaService.clientRequest.findMany({
               where: { clientProfileId, responseFor: null },
               include: { clientProfile: { include: { profile: true } } },
               orderBy: { createdAt: 'desc' },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.clientRequest.count(),
         ])

         return {
            data: clientRequests,
            hasMore: page * pageSize < totalCount,
            totalCount: totalCount,
         }
      } catch (error) {
         throw error
      }
   }
}
