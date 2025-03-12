import {
   Body,
   Controller,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { TransfertService } from './transfert.service'
import { InitTransfertDto } from './dto/initTransfert.dto'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'

@Controller('transfert')
export class TransfertController {
   constructor(private readonly transfertService: TransfertService) {}

   @Post('init')
   //    @SetMetadata('allowedRole', ['CLIENT'])
   //    @UseGuards(RolesGuard)
   async initTransfert(@Body() initTransfertDto: InitTransfertDto) {
      return await this.transfertService.initTransfert(initTransfertDto)
   }

   @Post('validate')
   //    @SetMetadata('allowedRole', ['CLIENT'])
   //    @UseGuards(RolesGuard)
   async validationTransfert(
      @Query('sub') clientProfileId: string,
      @Body('code') code: string,
   ) {
      return await this.transfertService.validationTransfert(
         clientProfileId,
         code,
      )
   }

   @Post('resend-code')
   //    @SetMetadata('allowedRole', ['CLIENT'])
   //    @UseGuards(RolesGuard)
   async resendCode(@Query('sub') clientProfileId: string) {
      return await this.transfertService.resendCode(clientProfileId)
   }
}
