import { IsNotEmpty, IsString } from 'class-validator'

export class ConfirmDeleteProfileDto {
   @IsString()
   @IsNotEmpty()
   profileId: string

   @IsString()
   @IsNotEmpty()
   code: string
}
