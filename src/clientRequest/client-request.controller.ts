import {
   Body,
   Controller,
   Delete,
   ForbiddenException,
   Get,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { ClientRequestService } from './client-request.service'
import { SendClientRequestDto } from './dto/send-client-request.dto'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { AnswerClientRequestDto } from './dto/answer-client-request.dto'
import { FindClientRequestService } from './find-client-request.service'
import { ProfileStatus, RequestFor } from '@prisma/client'
import { ROUTE_CLIENT_REQUEST } from 'routes/main-routes'
import {
   ROUTE_ANSWER_CLIENT_REQUEST,
   ROUTE_GET_CLIENT_REQUESTS,
   ROUTE_GET_CLIENT_REQUESTS_BY_CLIENT_REQUEST_ID,
   ROUTE_REMOVE_CLIENT_REQUEST,
   ROUTE_SEND_CLIENT_REQUEST,
} from 'routes/secondary-routes'

@Controller(ROUTE_CLIENT_REQUEST)
export class ClientRequestController {
   constructor(
      private readonly clientRequestSerivice: ClientRequestService,
      private readonly findClientRequestService: FindClientRequestService,
   ) {}

   @Post(ROUTE_SEND_CLIENT_REQUEST)
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async sendRequest(
      @GetUser('sub') clientProfileId: string,
      @Body() sendClientRequestDto: SendClientRequestDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.clientRequestSerivice.sendRequest(
         clientProfileId,
         clientProfileId,
         sendClientRequestDto,
      )
   }

   @Post(ROUTE_ANSWER_CLIENT_REQUEST)
   @SetMetadata('allowedRole', [
      'CLIENT',
      'CALL_CENTER',
      'MANAGER_HUB',
      'SUPER_ADMIN',
   ])
   @UseGuards(RolesGuard)
   async answerRequest(
      @Query('clientRequestId') clientRequestId: string,
      @GetUser('sub') senderId: string,
      @Body() answerClientRequestDto: AnswerClientRequestDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.clientRequestSerivice.answerRequest(
         clientRequestId,
         senderId,
         answerClientRequestDto,
      )
   }

   @Get()
   @SetMetadata('allowedRole', ['CALL_CENTER', 'MANAGER_HUB', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async getAllCientRequest(
      @Query('requestFor') requestFor: RequestFor,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.findClientRequestService.getAllCientRequest(
         requestFor,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_CLIENT_REQUESTS_BY_CLIENT_REQUEST_ID)
   @SetMetadata('allowedRole', ['CALL_CENTER', 'MANAGER_HUB', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async getClientRequestByClientRequestId(
      @Query('clientRequestId') clientRequestId: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.findClientRequestService.getRequests(
         clientRequestId,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_CLIENT_REQUESTS)
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async getClientRequests(
      @GetUser('sub') clientProfileId: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.findClientRequestService.getClientRequests(
         clientProfileId,
         page || 1,
         pageSize || 10,
      )
   }

   @Delete(ROUTE_REMOVE_CLIENT_REQUEST)
   @SetMetadata('allowedRole', [
      'ADMIN',
      'SUPER_ADMIN',
      'HUMAN_RESOURCES',
      'CLIENT',
   ])
   @UseGuards(RolesGuard)
   async removeRequest(@Query('clientRequestId') clientRequestId: string) {
      return await this.clientRequestSerivice.removeRequest(clientRequestId)
   }
}
