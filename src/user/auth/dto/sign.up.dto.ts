import {
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsDate,
   IsString,
   Matches,
   IsEmail,
   IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GenderType, UserRole } from 'enums/profile.enum'

export class SignUpDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261)(32|33|34|37|38)\d{7}$/, {
      message: 'Phone number must be in the format: +261 XX XX XXX XX',
   })
   phoneNumber: string

   @IsOptional()
   @IsEmail()
   email?: string

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

   @IsEnum(UserRole, {
      message:
         'Role must be one of the following values: CLIENT, DRIVER, ADMIN',
   })
   role: UserRole

   @IsOptional()
   @IsString({ message: 'Profile photo must be a valid string URL' })
   profilePhoto?: string

   @IsNotEmpty()
   @IsIn(['fr', 'mg', 'en', 'zh'], {
      message: 'Locale must be one of the following: fr, mg, en, zh',
   })
   locale: string
}
