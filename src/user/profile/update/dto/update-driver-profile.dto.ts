import { GenderType } from '@prisma/client'
import {
   IsArray,
   IsDateString,
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsString,
   IsUrl,
} from 'class-validator'

export class UpdateDriverProfileDto {
   @IsOptional()
   @IsNotEmpty({ message: 'First Name should not be empty' })
   @IsString({ message: 'First Name must be a string' })
   firstName?: string

   @IsOptional()
   @IsNotEmpty({ message: 'Last Name should not be empty' })
   @IsString({ message: 'Last Name must be a string' })
   lastName?: string

   @IsOptional()
   @IsNotEmpty({ message: 'Gender should not be empty' })
   @IsEnum(GenderType, { message: 'Invalid gender type' })
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

   @IsOptional()
   @IsArray({ message: 'CIN Photos must be an array of URLs' })
   @IsUrl({}, { each: true, message: 'Each CIN photo must be a valid URL' })
   cinPhotos?: string[]

   @IsOptional()
   @IsArray({ message: 'Permis Photos must be an array of URLs' })
   @IsUrl({}, { each: true, message: 'Each permis photo must be a valid URL' })
   permisPhotos?: string[]
}
