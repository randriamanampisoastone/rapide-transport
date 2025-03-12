import {
   IsNotEmpty,
   IsNumber,
   IsString,
   Matches,
   Max,
   Min,
   MinLength,
} from 'class-validator'

export class InitTransfertDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261|261|0)(32|33|34|37|38)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX, 261XXXXXXXXX, or 0XXXXXXXXX',
   })
   fromPhoneNumber: string

   @IsNotEmpty()
   @Matches(/^(?:\+261|261|0)(32|33|34|37|38)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX, 261XXXXXXXXX, or 0XXXXXXXXX',
   })
   toPhoneNumber: string

   @IsNumber({ allowInfinity: false, allowNaN: false })
   @IsNotEmpty()
   @Min(200)
   @Max(1000000)
   amount: number

   @IsNotEmpty()
   @IsString()
   @MinLength(4)
   walletPassword: string
}
