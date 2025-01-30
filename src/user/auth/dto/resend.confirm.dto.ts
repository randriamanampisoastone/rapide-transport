import { IsNotEmpty, Matches } from 'class-validator'

export class ResendConfirmDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261|261|0)(32|33|34|38|)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX or 261XXXXXXXXX or 0XXXXXXXXX',
   })
   phoneNumber: string
}
