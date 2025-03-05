import {
   Body,
   Controller,
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

@Controller('/client-request')
export class ClientRequestController {
   constructor(private readonly clientRequestSerivice: ClientRequestService) {}

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
   async answerRequest(
      @Query('clientRequestId') clientRequestId: string,
      @Query('sub') senderId: string,
      @Body() answerClientRequestDto: AnswerClientRequestDto,
   ) {
      return await this.clientRequestSerivice.answerRequest(
         clientRequestId,
         senderId,
         answerClientRequestDto,
      )
   }

   @Get()
   async getAllCientRequest() {}
}
