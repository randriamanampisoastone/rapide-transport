import { IsEnum, IsOptional, IsDate, IsString, Matches } from 'class-validator'
import { Type } from 'class-transformer'

enum GenderType {
   MALE = 'MALE',
   FEMALE = 'FEMALE',
   OTHER = 'OTHER',
}

export class UpdateDto {
   @IsOptional()
   @Matches(/^(?:\+261|261|0)(32|33|34|38)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX, 261XXXXXXXXX, or 0XXXXXXXXX',
   })
   phoneNumber?: string

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
