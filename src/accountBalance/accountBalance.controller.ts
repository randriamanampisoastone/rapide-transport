import { Controller, Patch, Query } from '@nestjs/common'
import { ResetBalanceServce } from './reset-balance.service'

@Controller('accountBalance')
export class AccountBalanceController {
   constructor(private readonly resetBalanceService: ResetBalanceServce) {}

   @Patch('reset')
   async resetBalance(@Query('accountBalanceId') accountBalanceId: string) {
      await this.resetBalanceService.resetBalance(accountBalanceId)
   }
}
