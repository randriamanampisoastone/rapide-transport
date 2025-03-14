import { MethodType, TransactionStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class GetClientTransactionByAdminDto {
   @IsString()
   @IsNotEmpty()
   profileId: string

   @IsEnum(MethodType)
   @IsNotEmpty()
   method: MethodType

   @IsEnum(TransactionStatus)
   @IsNotEmpty()
   status: TransactionStatus
}
