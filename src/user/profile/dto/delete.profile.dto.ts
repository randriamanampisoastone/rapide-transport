import { GenderType, RapideWalletStatus } from '@prisma/client'
import {
   IsBoolean,
   IsEnum,
   IsNotEmpty,
   IsNumber,
   IsString,
   Matches,
} from 'class-validator'

export class DeleteProfileDto {
   @IsString()
   @IsNotEmpty()
   sub: string

   @IsString()
   @IsNotEmpty()
   code: string

   @IsString()
   @IsNotEmpty()
   rapideWalletId: string

   @IsBoolean()
   @IsNotEmpty()
   isProfileVerified: boolean

   @IsString()
   @IsNotEmpty()
   firstName: string

   @IsString()
   @IsNotEmpty()
   lastName: string

   @IsString()
   @IsNotEmpty()
   profilePhoto: string

   @IsEnum(GenderType)
   @IsNotEmpty()
   gender: GenderType

   @IsNumber()
   @IsNotEmpty()
   balance: number

   @IsEnum(RapideWalletStatus)
   @IsNotEmpty()
   rapideWalletStatus: RapideWalletStatus

   @IsNumber()
   attempt: number

   @IsNotEmpty()
   @Matches(/^(?:\+261|261|0)(32|33|34|37|38)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX, 261XXXXXXXXX, or 0XXXXXXXXX',
   })
   phoneNumber: string
}
