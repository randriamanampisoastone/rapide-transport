import {
   Body,
   Controller,
   ForbiddenException,
   Post,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { ProfileStatus } from '@prisma/client'
import { InitTransferDto } from './dto/initTransfer.dto'
import { TransferService } from './transfer.service'

@Controller('transfer')
export class TransferController {
   constructor(private readonly transferService: TransferService) {}

   @Post('init')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async initTransfer(
      @Body() initTransferDto: InitTransferDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.initTransfer(initTransferDto)
   }

   @Post('validate')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async validationTransfer(
      @GetUser('sub') clientProfileId: string,
      @Body('code') code: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.validationTransfer(
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
      return await this.transferService.resendCode(clientProfileId)
   }
}
