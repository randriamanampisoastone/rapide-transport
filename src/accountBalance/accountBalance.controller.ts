import {
   Body,
   Controller,
   Get,
   Patch,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { ResetBalanceServce } from './reset-balance.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { DriverBalanceService } from './driverBalance.service'
import { ClientBalanceService } from './client-balance.service'
import { AmountDto } from './dto/amount.dto'
import {
   DecrementClientBalance,
   IncrementClientAccountBalanceDto,
} from './dto/client-account-balance.dto'

@Controller('accountBalance')
export class AccountBalanceController {
   constructor(
      private readonly resetBalanceService: ResetBalanceServce,
      private readonly getRapideBalanceService: GetRapideBalanceService,
      private readonly driverBalanceService: DriverBalanceService,
      private readonly clientBalanceService: ClientBalanceService,
   ) {}

   @Patch('resetDriverBalance')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async resetRideBalance(@Query('accountBalanceId') accountBalanceId: string) {
      await this.resetBalanceService.resetRideBalance(accountBalanceId)
   }

   @Patch('resetAllDriverBalance')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async reseAllRideBalance() {
      await this.resetBalanceService.resetAllRideBalance()
   }

   @Get('getRapideBalance')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getRapideBalance() {
      return await this.getRapideBalanceService.getRapidebalance()
   }

   @Get('sold')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   async getSold(@GetUser('sub') driverProfileId: string) {
      return await this.driverBalanceService.getSold(driverProfileId)
   }

   @Patch('incrementClientBalance')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async incrementClientBalance(
      @Query('clientProfileId') clientProfileId: string,
      @Body()
      incrementClientAccountBalanceDto: IncrementClientAccountBalanceDto,
   ) {
      return await this.clientBalanceService.incrementClientBalanceByAdmin(
         clientProfileId,
         incrementClientAccountBalanceDto,
      )
   }

   @Patch('decrementClientBalance')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async decrementClientBalance(
      @Query('clientProfileId') clientProfileId: string,
      @Body()
      decrementClientAccountBalanceDto: IncrementClientAccountBalanceDto,
   ) {
      return await this.clientBalanceService.decrementClientBalanceByAdmin(
         clientProfileId,
         decrementClientAccountBalanceDto,
      )
   }
}
