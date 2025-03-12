import { PaymentMethodType } from '@prisma/client'
import {
   IsEnum,
   IsNotEmpty,
   IsNumber,
   IsPositive,
   IsString,
   Matches,
   Max,
   Min,
} from 'class-validator'

export class DepositeDto {
   @IsString()
   @IsNotEmpty()
   transactionPassword: string

   @IsNumber({ allowInfinity: false, allowNaN: false })
   @IsNotEmpty()
   @Min(200)
   @Max(1000000)
   amount: number

   @IsEnum(PaymentMethodType)
   @IsNotEmpty()
   paymentMethodType: PaymentMethodType
}
