import {
   Body,
   Controller,
   ForbiddenException,
   Post,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { RidePaymentService } from './ride-payment.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { InitRapideWalletPayment } from './dto/initRapideWalletPayment.dto'
import { ProfileStatus, UserRole } from '@prisma/client'
import { ROUTE_PAYMENT_RIDE } from 'routes/main-routes'
import {
   ROUTE_CONFIRM_PAYMENT_WITH_RAPIDE_WALLET,
   ROUTE_RESEND_CONFIRM_PAYMENT_WITH_RAPIDE_WALLET,
   ROUTE_START_PAYMENT_WITH_RAPIDE_WALLET,
} from 'routes/secondary-routes'

@Controller(ROUTE_PAYMENT_RIDE)
export class RidePaymentController {
   constructor(private readonly ridePaymentService: RidePaymentService) {}

   @Post(ROUTE_START_PAYMENT_WITH_RAPIDE_WALLET)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async startPaymentWithRapideWallet(
      @GetUser('sub') clientProfileId: string,
      @Body() initRapideWalletPayment: InitRapideWalletPayment,
      @GetUser('status') status: ProfileStatus,
      @GetUser('locale') locale: string,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return await this.ridePaymentService.startPaymentWithRapideWallet(
         clientProfileId,
         initRapideWalletPayment,
         locale,
      )
   }

   @Post(ROUTE_CONFIRM_PAYMENT_WITH_RAPIDE_WALLET)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async confirmRapideWalletPayment(
      @GetUser('sub') clientProfileId: string,
      @Body('code') code: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return await this.ridePaymentService.confirmRapideWalletPayment(
         clientProfileId,
         code,
      )
   }

   @Post(ROUTE_RESEND_CONFIRM_PAYMENT_WITH_RAPIDE_WALLET)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async resendConfirmPaymentWithRapideWallet(
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
      @GetUser('locale') locale: string,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return await this.ridePaymentService.resendConfirmRapideWalletPayment(
         clientProfileId,
         locale,
      )
   }
}
