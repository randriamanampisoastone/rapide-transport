import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class FindClientRequestService {
   constructor(private readonly prismaService: PrismaService) {}

   async getAllCientRequest() {
      try {
         const clientRequests = await this.prismaService.clientRequest.findMany(
            {
               where: { responseFor: null },
               include: { clientProfile: { include: { profile: true } } },
               orderBy: { createdAt: 'desc' },
            },
         )

         return clientRequests
      } catch (error) {
         throw error
      }
   }

   async getRequests(clientRequestId: string) {
      try {
         const clientRequests = await this.prismaService.clientRequest.findMany(
            {
               where: {
                  OR: [{ responseFor: clientRequestId }, { clientRequestId }],
               },
               include: { clientProfile: { include: { profile: true } } },
               orderBy: { createdAt: 'desc' },
            },
         )

         return clientRequests
      } catch (error) {
         throw error
      }
   }

   async getClientRequests(clientProfileId: string) {
      try {
         const clientRequests = await this.prismaService.clientRequest.findMany(
            {
               where: { clientProfileId, responseFor: null },
               include: { clientProfile: { include: { profile: true } } },
               orderBy: { createdAt: 'desc' },
            },
         )

         return clientRequests
      } catch (error) {
         throw error
      }
   }
}
