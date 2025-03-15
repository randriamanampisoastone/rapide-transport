import { MethodType, TransactionType } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator"

export class IncrementClientRapideWalletDto {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    amount: number

    @IsEnum(MethodType)
    @IsNotEmpty()
    methode: MethodType
}

export class DecrementClientBalance extends IncrementClientRapideWalletDto {
    @IsString()
    @IsNotEmpty()
    from: string

    @IsString()
    @IsNotEmpty()
    to: string

    @IsEnum(TransactionType)
    @IsNotEmpty()
    transactionType: TransactionType
}