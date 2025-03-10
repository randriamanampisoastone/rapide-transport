import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class AmountDto {
    @IsNotEmpty()
    @IsNumber({allowInfinity: false, allowNaN: false})
    @IsPositive()
    amount: number
}