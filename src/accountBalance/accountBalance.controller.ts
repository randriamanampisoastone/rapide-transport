import {
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

@Controller('accountBalance')
export class AccountBalanceController {
   constructor(
      private readonly resetBalanceService: ResetBalanceServce,
      private readonly getRapideBalanceService: GetRapideBalanceService,
   ) {}

   @Patch('reset')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async resetBalance(@Query('accountBalanceId') accountBalanceId: string) {
      await this.resetBalanceService.resetBalance(accountBalanceId)
   }

   @Get('getRapideBalance')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getRapideBalance() {
      return await this.getRapideBalanceService.getRapidebalance()
   }
}
