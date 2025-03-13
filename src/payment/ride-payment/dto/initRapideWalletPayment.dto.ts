import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'

export class InitRapideWalletPayment {
   @IsNotEmpty()
   @IsString()
   @MinLength(4)
   walletPassword: string
}
