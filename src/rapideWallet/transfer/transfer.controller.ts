import {
   Body,
   Controller,
   ForbiddenException,
   Get,
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
   @SetMetadata('allowedRole', [UserRole.CLIENT, UserRole.DRIVER])
   @UseGuards(RolesGuard)
   async startTransfer(
      @Body() initTransferDto: InitTransferDto,
      @GetUser('status') status: ProfileStatus,
      @GetUser('role') role: UserRole,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.startTransfer(initTransferDto, role)
   }

   @Post(ROUTE_CONFIRM_TRANSFER)
   @SetMetadata('allowedRole', [UserRole.CLIENT, UserRole.DRIVER])
   @UseGuards(RolesGuard)
   async confirmTransfer(
      @GetUser('sub') profileId: string,
      @Body('code') code: string,
      @GetUser('status') status: ProfileStatus,
      @GetUser('role') role: UserRole,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.confirmTransfer(profileId, code, role)
   }

   @Get(ROUTE_RESEND_CONFIRM_TRANSFER)
   @SetMetadata('allowedRole', [UserRole.CLIENT, UserRole.DRIVER])
   @UseGuards(RolesGuard)
   async resendCode(
      @GetUser('sub') profileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.transferService.resendCode(profileId)
   }
}
