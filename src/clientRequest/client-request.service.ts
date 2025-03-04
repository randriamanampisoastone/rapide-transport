import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SendClientRequestDto } from './dto/send-client-request.dto'
import { AnswerClientRequestDto } from './dto/answer-client-request.dto'

@Injectable()
export class ClientRequestService {
   constructor(private readonly prismaService: PrismaService) {}

   async sendRequest(
      clientProfileId: string,
      senderId: string,
      sendClientRequestDto: SendClientRequestDto,
   ) {
      try {
         return await this.prismaService.clientRequest.create({
            data: {
               clientProfileId,
               senderId,
               ...sendClientRequestDto,
            },
         })
      } catch (error) {
         throw error
      }
   }

   async answerRequest(
      clientRequestId: string,
      senderId: string,
      answerClientRequestDto: AnswerClientRequestDto,
   ) {
      try {
         const clientRequest =
            await this.prismaService.clientRequest.findUnique({
               where: { clientRequestId },
               select: {
                  requestFor: true,
                  clientProfileId: true,
                  clientRequestId: true,
               },
            })

         return await this.prismaService.clientRequest.create({
            data: {
               clientProfileId: clientRequest.clientProfileId,
               requestFor: clientRequest.requestFor,
               senderId,
               ...answerClientRequestDto,
               responseFor: clientRequest.clientRequestId,
            },
         })
      } catch (error) {
         throw error
      }
   }

   async getAllCientRequest() {
      try {
         const clientRequests = await this.prismaService.clientRequest.groupBy({
            by: ['clientRequestId'],
         })

         return clientRequests
      } catch (error) {
         throw error
      }
   }
}
