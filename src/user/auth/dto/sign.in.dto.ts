import { IsEnum, IsNotEmpty, Matches } from 'class-validator'
import { UserRole } from 'enums/profile.enum'

export class SignInDto {
   @IsNotEmpty()
   @Matches(/^(?:\+261|261|0)(32|33|34|38|)\d{7}$/, {
      message:
         'Phone number must be in the format: +261XXXXXXXXX or 261XXXXXXXXX or 0XXXXXXXXX',
   })
   phoneNumber: string

   @IsEnum(UserRole, {
      message:
         'User Role must be one of the following values: CLIENT, DRIVER, ADMIN, MANAGER',
   })
   role: string
}
