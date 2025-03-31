import { IsIn, IsNotEmpty, IsString, Length, Matches } from 'class-validator'

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

   @IsNotEmpty()
   @Matches(/^(?:\+261)(32|33|34|37|38)\d{7}$/, {
      message: 'Phone number must be in the format: +261 XX XX XXX XX',
   })
   phoneNumber: string

   @IsNotEmpty()
   @IsIn(['fr', 'mg', 'en', 'zh'], {
      message: 'Locale must be one of the following: fr, mg, en, zh',
   })
   locale: string
}
