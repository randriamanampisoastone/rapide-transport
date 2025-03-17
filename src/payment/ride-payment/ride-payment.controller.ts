import {
   Body,
   Controller,
   ForbiddenException,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { RidePaymentService } from './ride-payment.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { InitRapideWalletPayment } from './dto/initRapideWalletPayment.dto'
import { ProfileStatus } from '@prisma/client'

@Controller('ride-payment')
export class RidePaymentController {
   constructor(private readonly ridePaymentService: RidePaymentService) {}

   @Post('init-rapide-wallet-payment')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async initRapideWalletPayment(
      @GetUser('sub') clientProfileId: string,
      @Body() initRapideWalletPayment: InitRapideWalletPayment,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return await this.ridePaymentService.initRapideWalletPayment(
         clientProfileId,
         initRapideWalletPayment,
      )
   }

   @Post('validate-rapide-wallet-payment')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async validateRapideWalletPayment(
      @GetUser('sub') clientProfileId: string,
      @Body('code') code: string,
   ) {
      return await this.ridePaymentService.validateRapideWalletPayment(
         clientProfileId,
         code,
      )
   }
}
