import { IsNotEmpty, IsString } from 'class-validator'

export class ConfirmDeleteProfileDto {
   @IsString()
   @IsNotEmpty()
   clientProfileId: string

   @IsString()
   @IsNotEmpty()
   code: string
}
