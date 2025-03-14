import { RapideWalletStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class UpdateRapideWalletStatusDto {
   @IsEnum(RapideWalletStatus)
   @IsNotEmpty()
   status: RapideWalletStatus

   @IsString()
   @IsNotEmpty()
   rapideWalletId: string
}
