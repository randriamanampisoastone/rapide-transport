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
import { SetRapideWalletInfoDto } from './dto/set-rapide-wallet-information.dto'
import { RapideWalletService } from './rapide-wallet.service'
import { UpdateRapideWalletStatusDto } from './dto/update-rapide-wallet-status.dto'

@Controller('rapideWallet')
export class RapideWalletController {
   constructor(
      private readonly resetBalanceService: ResetBalanceServce,
      private readonly getRapideBalanceService: GetRapideBalanceService,
      private readonly driverBalanceService: DriverBalanceService,
      private readonly rapideWalletService: RapideWalletService,
   ) {}

   @Patch('resetDriverBalance')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FINANCE_MANAGER'])
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

   @Get('getRapideBalance')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FINANCE_MANAGER'])
   @UseGuards(RolesGuard)
   async getRapideBalance(@GetUser('status') status: ProfileStatus) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getRapideBalanceService.getRapidebalance()
   }

   @Get('sold')
   @SetMetadata('allowedRole', ['DRIVER', 'CLIENT'])
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

   @Patch('set-rapide-wallet-information')
   @SetMetadata('allowedRole', ['DRIVER', 'CLIENT'])
   @UseGuards(RolesGuard)
   async setInformation(
      @GetUser('sub') profileId: string,
      @Body() setRapideWalletInfoDto: SetRapideWalletInfoDto,
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

   @Post('validate-rapide-wallet-info')
   @SetMetadata('allowedRole', ['DRIVER', 'CLIENT'])
   @UseGuards(RolesGuard)
   async validateInformation(
      @GetUser('sub') profileId: string,
      @GetUser('role') userRole: UserRole,
      @GetUser('status') status: ProfileStatus,
      @Body() data: { code: string },
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.validateInformation(
         profileId,
         data.code,
         userRole,
      )
   }

   @Post('resend-code')
   @SetMetadata('allowedRole', ['DRIVER', 'CLIENT'])
   @UseGuards(RolesGuard)
   async resendCode(
      @GetUser('sub') profileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rapideWalletService.resendCode(profileId)
   }

   @Patch('update-status')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FINANCE_MANAGER'])
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

   @Get('get-rapide-wallet')
   @SetMetadata('allowedRole', ['CLIENT', 'DRIVER'])
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
