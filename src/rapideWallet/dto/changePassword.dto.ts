import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
   @IsNotEmpty()
   @IsString()
   @MinLength(4)
   oldWalletPassword: string

   @IsNotEmpty()
   @IsString()
   @MinLength(4)
   newWalletPassword: string
}
