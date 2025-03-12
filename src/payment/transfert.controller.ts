import {
   Body,
   Controller,
   ForbiddenException,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { TransfertService } from './transfert.service'
import { InitTransfertDto } from './dto/initTransfert.dto'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { ProfileStatus } from '@prisma/client'

@Controller('transfert')
export class TransfertController {
   constructor(private readonly transfertService: TransfertService) {}

   @Post('init')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async initTransfert(
      @Body() initTransfertDto: InitTransfertDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transfertService.initTransfert(initTransfertDto)
   }

   @Post('validate')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async validationTransfert(
      @GetUser('sub') clientProfileId: string,
      @Body('code') code: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transfertService.validationTransfert(
         clientProfileId,
         code,
      )
   }

   @Post('resend-code')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async resendCode(
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transfertService.resendCode(clientProfileId)
   }
}
