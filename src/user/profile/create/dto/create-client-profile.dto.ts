export enum GenderType {
   MALE = 'MALE',
   FEMALE = 'FEMALE',
   OTHER = 'OTHER',
}
import {
   IsDateString,
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsString,
   IsUrl,
} from 'class-validator'

export class CreateClientProfileDto {
   @IsNotEmpty({ message: 'First Name should not be empty' })
   @IsString({ message: 'First Name must be a string' })
   firstName: string

   @IsNotEmpty({ message: 'Last Name should not be empty' })
   @IsString({ message: 'Last Name must be a string' })
   lastName: string

   @IsEnum(GenderType, {
      message: 'Invalid gender value, the gender must be : MALE, FEMALE, OTHER',
   })
   gender: GenderType

   @IsDateString(
      {},
      { message: 'Birthday must be a valid date in ISO 8601 format' },
   )
   birthday: string

   @IsOptional()
   @IsUrl()
   profilePhoto: string
}
