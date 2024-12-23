import { GenderType } from '@prisma/client'
import {
   IsDateString,
   IsEnum,
   IsOptional,
   IsString,
   IsUrl,
} from 'class-validator'

export class UpdateClientProfileDto {
   @IsOptional()
   @IsString({ message: 'First Name must be a string' })
   firstName?: string

   @IsOptional()
   @IsString({ message: 'Last Name must be a string' })
   lastName?: string

   @IsOptional()
   @IsEnum(GenderType, {
      message: 'Invalid gender value, the gender must be : MALE, FEMALE, OTHER',
   })
   gender?: GenderType

   @IsOptional()
   @IsDateString(
      {},
      { message: 'Birthday must be a valid date in ISO 8601 format' },
   )
   birthday?: Date

   @IsOptional()
   @IsUrl({}, { message: 'Profile Photo must be a valid URL' })
   profilePhoto?: string
}
