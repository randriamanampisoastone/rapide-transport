import { IsNotEmpty, IsString, Length } from 'class-validator'

export class SetRapideWalletInformationDto {
   @IsString()
   @IsNotEmpty()
   @Length(12)
   idCard: string

   @IsString()
   @IsNotEmpty()
   idCardPhotoRecto: string

   @IsString()
   @IsNotEmpty()
   idCardPhotoVerso: string

   @IsString()
   @IsNotEmpty()
   password: string
}
