import {
   Body,
   Controller,
   Patch,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { PaymentWithRapideWalletService } from './payment-with-rapide-wallet.service'
import { amountDto } from './dto/amount.dto'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { TransactionService } from './transaction.service'

@Controller('payment')
export class PaymentController {
   constructor(
      private readonly paymentWithRapideWalletService: PaymentWithRapideWalletService,
      private readonly transactionService: TransactionService,
   ) {}

   @Post('with-rapide-wallet')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async PaymentWithRapideBalance(
      @GetUser('sub') clientProfileId: string,
      @Query('to') to: string,
      @Body() amount: amountDto,
   ) {
      return await this.paymentWithRapideWalletService.payment(
         clientProfileId,
         to,
         amount.amount,
      )
   }

   @Patch('update-transaction')
   async updateTransaction(
      @Query('paymentTransactionId') paymentTransactionId: string,
      @Body() updateTransactionDto: UpdateTransactionDto,
   ) {
      return await this.transactionService.update(
         paymentTransactionId,
         updateTransactionDto,
      )
   }
}
