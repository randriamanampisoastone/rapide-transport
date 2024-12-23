import { GenderType } from '@prisma/client'
import {
   IsArray,
   IsDateString,
   IsEnum,
   IsNotEmpty,
   IsString,
   IsUrl,
} from 'class-validator'

export class CreateDriverProfileDto {
   @IsNotEmpty({ message: 'First Name should not be empty' })
   @IsString({ message: 'First Name must be a string' })
   firstName: string

   @IsNotEmpty({ message: 'Last Name should not be empty' })
   @IsString({ message: 'Last Name must be a string' })
   lastName: string

   @IsNotEmpty({ message: 'Gender should not be empty' })
   @IsEnum(GenderType, { message: 'Invalid gender type' })
   gender: GenderType

   @IsDateString(
      {},
      { message: 'Birthday must be a valid date in ISO 8601 format' },
   )
   birthday: string

   @IsUrl({}, { message: 'Profile Photo must be a valid URL' })
   profilePhoto: string

   @IsArray({ message: 'CIN Photos must be an array of URLs' })
   @IsUrl({}, { each: true, message: 'Each CIN photo must be a valid URL' })
   cinPhotos: string[]

   @IsArray({ message: 'Permis Photos must be an array of URLs' })
   @IsUrl({}, { each: true, message: 'Each permis photo must be a valid URL' })
   permisPhotos: string[]
}
