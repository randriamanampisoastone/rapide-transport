import { IsEnum, IsIn, IsNotEmpty, Matches } from 'class-validator'
import { UserRole } from 'enums/profile.enum'

export class SignInDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261)(32|33|34|37|38)\d{7}$/, {
      message: 'Phone number must be in the format: +261 XX XX XXX XX',
   })
   phoneNumber: string

   @IsEnum(UserRole, {
      message:
         'User Role must be one of the following values: CLIENT, DRIVER, ADMIN',
   })
   role: UserRole

   @IsNotEmpty()
   @IsIn(['fr', 'mg', 'en', 'zh'], {
      message: 'Locale must be one of the following: fr, mg, en, zh',
   })
   locale: string
}
