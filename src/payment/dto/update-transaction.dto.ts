import { PaymentTransactionStatus } from "@prisma/client"
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class UpdateTransactionDto {
    @IsOptional()
    @IsNumber({allowInfinity: false, allowNaN: false})
    @IsPositive()
    return?: number

    @IsOptional()
    @IsEnum(PaymentTransactionStatus)
    paymentTransactionStatus?: PaymentTransactionStatus

    @IsOptional()
    @IsString()
    description?: string
}