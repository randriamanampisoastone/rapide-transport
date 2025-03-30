import {
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsDate,
   IsString,
   Matches,
   IsEmail,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GenderType, UserRole } from 'enums/profile.enum'

export class UpdateProfileDto {
   @IsOptional()
   @IsEmail()
   email?: string

   @IsOptional()
   @IsString()
   firstName?: string

   @IsOptional()
   @IsString()
   lastName?: string

   @IsOptional()
   @IsEnum(GenderType, {
      message:
         'Gender must be one of the following values: MALE, FEMALE, OTHER',
   })
   gender?: GenderType

   @IsOptional()
   @Type(() => Date)
   @IsDate({
      message: 'Birthday must be a valid date in the format YYYY-MM-DD',
   })
   birthday?: Date

   @IsOptional()
   @IsString({ message: 'Profile photo must be a valid string URL' })
   profilePhoto?: string
}
