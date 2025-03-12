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

@Controller('/client-request')
export class ClientRequestController {
   constructor(
      private readonly clientRequestSerivice: ClientRequestService,
      private readonly findClientRequestService: FindClientRequestService,
   ) {}

   @Post('send')
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

   @Post('answer')
   @SetMetadata('allowedRole', [
      'CLIENT',
      'ADMIN',
      'SUPER_ADMIN',
      'CUSTOMER_SUPPORT',
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
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SUPPORT'])
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

   @Get('get-requests')
   @SetMetadata('allowedRole', [
      'ADMIN',
      'SUPER_ADMIN',
      'CUSTOMER_SUPPORT',
      'CLIENT',
   ])
   @UseGuards(RolesGuard)
   async getRequests(
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

   @Get('get-client-requests')
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

   @Delete('remove-client-request')
   @SetMetadata('allowedRole', [
      'ADMIN',
      'SUPER_ADMIN',
      'CUSTOMER_SUPPORT',
      'CLIENT',
   ])
   @UseGuards(RolesGuard)
   async removeRequest(@Query('clientRequestId') clientRequestId: string) {
      return await this.clientRequestSerivice.removeRequest(clientRequestId)
   }
}
