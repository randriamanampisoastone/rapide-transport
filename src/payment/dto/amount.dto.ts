import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

export class amountDto {
   @IsNumber({ allowInfinity: false, allowNaN: false })
   @IsNotEmpty()
   @IsPositive()
   amount: number
}
