import { IsNotEmpty, IsNumber, IsString, Matches, MinLength } from 'class-validator'

export class InitRapideWalletPayment {
   @IsNotEmpty()
   @IsString()
   @MinLength(4)
   password: string

   @IsNotEmpty()
   @IsNumber()
   upperPrice: number
}
