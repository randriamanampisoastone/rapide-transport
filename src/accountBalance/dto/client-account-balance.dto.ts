import { PaymentMethodType, PaymentTransactionType } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator"

export class IncrementClientAccountBalanceDto {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    amount: number

    @IsEnum(PaymentMethodType)
    @IsNotEmpty()
    paymentMethode: PaymentMethodType
}

export class DecrementClientBalance extends IncrementClientAccountBalanceDto {
    @IsString()
    @IsNotEmpty()
    from: string

    @IsString()
    @IsNotEmpty()
    to: string

    @IsEnum(PaymentTransactionType)
    @IsNotEmpty()
    paymentTransactionType: PaymentTransactionType
}