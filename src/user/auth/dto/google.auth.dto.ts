import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { UserRole } from 'enums/profile.enum'

export class GoogleAuthDto {
   @IsString()
   @IsNotEmpty()
   idToken: string

   @IsEnum(UserRole)
   @IsNotEmpty()
   userRole: UserRole

   @IsNotEmpty()
   @IsIn(['fr', 'mg', 'en', 'zh'], {
      message: 'Locale must be one of the following: fr, mg, en, zh',
   })
   locale: string
}
