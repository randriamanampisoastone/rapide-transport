import {
   Body,
   Controller,
   Delete,
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
   ) {
      return await this.clientRequestSerivice.sendRequest(
         clientProfileId,
         clientProfileId,
         sendClientRequestDto,
      )
   }

   @Post('answer')
   @SetMetadata('allowedRole', ['CLIENT', 'ADMIN'])
   @UseGuards(RolesGuard)
   async answerRequest(
      @Query('clientRequestId') clientRequestId: string,
      @GetUser('sub') senderId: string,
      @Body() answerClientRequestDto: AnswerClientRequestDto,
   ) {
      return await this.clientRequestSerivice.answerRequest(
         clientRequestId,
         senderId,
         answerClientRequestDto,
      )
   }

   @Get()
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getAllCientRequest(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.findClientRequestService.getAllCientRequest(
         page || 1,
         pageSize || 10,
      )
   }

   @Get('get-requests')
   @SetMetadata('allowedRole', ['ADMIN', 'CLIENT'])
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
   ) {
      return await this.findClientRequestService.getClientRequests(
         clientProfileId,
         page || 1,
         pageSize || 10,
      )
   }

   @Delete('remove-client-request')
   @SetMetadata('allowedRole', ['ADMIN', 'CLIENT'])
   @UseGuards(RolesGuard)
   async removeRequest(@Query('clientRequestId') clientRequestId: string) {
      return await this.clientRequestSerivice.removeRequest(clientRequestId)
   }
}
