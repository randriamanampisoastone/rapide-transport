import {
   Body,
   Controller,
   ForbiddenException,
   Get,
   Patch,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { ResetBalanceServce } from './reset-balance.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { DriverBalanceService } from './driverBalance.service'
import { ProfileStatus, UserRole } from '@prisma/client'
import { RapideWalletService } from './rapide-wallet.service'
import { UpdateRapideWalletStatusDto } from './dto/update-rapide-wallet-status.dto'
import { SetRapideWalletInformationDto } from './dto/set-rapide-wallet-information.dto'
import { ResendConfirmationCodeRapideWalletInformationDto } from './dto/resend-confirmation-code-rapide-wallet-information.dto'
import { ROUTE_RAPIDE_WALLET } from 'routes/main-routes'
import {
   ROUTE_CONFIRM_RAPIDE_WALLET_INFORMATION,
   ROUTE_GET_RAPIDE_BALANCE,
   ROUTE_GET_RAPIDE_WALLET,
   ROUTE_GET_SOLDE,
   ROUTE_RESEND_CONFIRM_RAPIDE_WALLET_INFORMATION,
   ROUTE_RESET_DRIVER_BALANCE,
   ROUTE_SET_RAPIDE_WALLET_INFORMATION,
   ROUTE_UPDATE_RAPIDE_WALLET_STATUS,
} from 'routes/secondary-routes'

@Controller(ROUTE_RAPIDE_WALLET)
export class RapideWalletController {
   constructor(
      private readonly resetBalanceService: ResetBalanceServce,
      private readonly getRapideBalanceService: GetRapideBalanceService,
      private readonly driverBalanceService: DriverBalanceService,
      private readonly rapideWalletService: RapideWalletService,
   ) {}

   @Patch(ROUTE_RESET_DRIVER_BALANCE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async resetRideBalance(
      @Query('rapideWalletId') rapideWalletId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      await this.resetBalanceService.resetRideBalance(rapideWalletId)
   }

   @Get(ROUTE_GET_RAPIDE_BALANCE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async getRapideBalance(@GetUser('status') status: ProfileStatus) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getRapideBalanceService.getRapidebalance()
   }

   @Get(ROUTE_GET_SOLDE)
   @SetMetadata('allowedRole', [UserRole.DRIVER, UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async getSold(
      @GetUser('sub') profileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.driverBalanceService.getSold(profileId)
   }

   @Patch(ROUTE_SET_RAPIDE_WALLET_INFORMATION)
   @SetMetadata('allowedRole', [UserRole.DRIVER, UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async setInformation(
      @GetUser('sub') profileId: string,
      @Body() setRapideWalletInfoDto: SetRapideWalletInformationDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.setRapideWalletInformation(
         profileId,
         setRapideWalletInfoDto,
      )
   }

   @Post(ROUTE_CONFIRM_RAPIDE_WALLET_INFORMATION)
   @SetMetadata('allowedRole', [UserRole.DRIVER, UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async confirmRapideWalletInformation(
      @GetUser('sub') profileId: string,
      @GetUser('role') userRole: UserRole,
      @GetUser('status') status: ProfileStatus,
      @Body() data: { phoneNumber: string; confirmationCode: string },
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.confirmRapideWalletInformation(
         profileId,
         data.phoneNumber,
         data.confirmationCode,
         userRole,
      )
   }

   @Post(ROUTE_RESEND_CONFIRM_RAPIDE_WALLET_INFORMATION)
   @SetMetadata('allowedRole', [UserRole.DRIVER, UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async resendCode(
      @GetUser('sub') profileId: string,
      @GetUser('status') status: ProfileStatus,
      @Body() data: ResendConfirmationCodeRapideWalletInformationDto,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.resendCode(profileId, data)
   }

   @Patch(ROUTE_UPDATE_RAPIDE_WALLET_STATUS)
   @SetMetadata('allowedRole', [
      UserRole.DEPOSITOR,
      UserRole.SUPER_ADMIN,
      UserRole.TREASURER,
   ])
   @UseGuards(RolesGuard)
   async updateStatus(
      @Body() updateRapideWalletStatusDto: UpdateRapideWalletStatusDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.updateStatus(
         updateRapideWalletStatusDto.rapideWalletId,
         updateRapideWalletStatusDto.status,
      )
   }

   @Get(ROUTE_GET_RAPIDE_WALLET)
   @SetMetadata('allowedRole', [UserRole.DRIVER, UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async getRapideWallete(
      @GetUser('sub') profileId: string,
      @GetUser('role') userRole: UserRole,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.getRapideWallet(profileId, userRole)
   }
}
