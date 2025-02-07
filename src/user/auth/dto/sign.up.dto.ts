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

export class SignUpDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261|261|0)(32|33|34|38)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX, 261XXXXXXXXX, or 0XXXXXXXXX',
   })
   phoneNumber: string

   @IsOptional()
   @IsEmail()
   email?: string

   @IsNotEmpty()
   @IsString()
   firstName: string

   @IsNotEmpty()
   @IsString()
   lastName: string

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
}
