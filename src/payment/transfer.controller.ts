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
import { ProfileStatus, UserRole } from '@prisma/client'
import { InitTransferDto } from './dto/initTransfer.dto'
import { TransferService } from './transfer.service'
import { ROUTE_TRANSFER } from 'routes/main-routes'
import {
   ROUTE_CONFIRM_TRANSFER,
   ROUTE_RESEND_CONFIRM_TRANSFER,
   ROUTE_START_TRANSFER,
} from 'routes/secondary-routes'

@Controller(ROUTE_TRANSFER)
export class TransferController {
   constructor(private readonly transferService: TransferService) {}

   @Post(ROUTE_START_TRANSFER)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async startTransfer(
      @Body() initTransferDto: InitTransferDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.startTransfer(initTransferDto)
   }

   @Post(ROUTE_CONFIRM_TRANSFER)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async confirmTransfer(
      @GetUser('sub') clientProfileId: string,
      @Body('code') code: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.confirmTransfer(clientProfileId, code)
   }

   @Post(ROUTE_RESEND_CONFIRM_TRANSFER)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
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
