import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class CheckPromotionCodeDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261)(32|33|34|37|38)\d{7}$/, {
      message: 'Phone number must be in the format: +261 XX XX XXX XX',
   })
   phoneNumber: string

   @IsNotEmpty()
   @IsString()
   promotionCode: string
}
