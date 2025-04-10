import {
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsDate,
   IsString,
   Matches,
   IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GenderType } from 'enums/profile.enum'

export class CreateSuperAdminDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261)(32|33|34|37|38)\d{7}$/, {
      message: 'Phone number must be in the format: +261 XX XX XXX XX',
   })
   phoneNumber: string

   @IsNotEmpty()
   @IsString()
   firstName: string

   @IsOptional()
   @IsString()
   lastName?: string

   @IsEnum(GenderType, {
      message:
         'Gender must be one of the following values: MALE, FEMALE, OTHER',
   })
   gender: GenderType

   @IsNotEmpty()
   @Type(() => Date)
   @IsDate({
      message: 'Birthday must be a valid date in the format YYYY-MM-DD',
   })
   birthday: Date

   @IsOptional()
   @IsString({ message: 'Profile photo must be a valid string URL' })
   profilePhoto?: string
}
