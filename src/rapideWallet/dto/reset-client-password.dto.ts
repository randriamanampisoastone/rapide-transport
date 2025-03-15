import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetClientPasswordDto {
   @IsString()
   @IsNotEmpty()
   @MinLength(4)
   newPassword: string

   @IsString()
   @IsNotEmpty()
   clientProfileId: string
}
