import { IsEnum } from 'class-validator'
import { SignInDto } from './sign-in.dto'

export enum UserRoleEnum {
   Client = 'ClientGroup',
   Admin = 'AdminGroup',
   Provider = 'ProviderGroup',
   Driver = 'DriverGroup',
}

export class SignUpDto extends SignInDto {
   @IsEnum(UserRoleEnum, {
      message:
         'Role must be one of the following values: ClientGroup, AdminGroup, ProviderGroup',
   })
   role: UserRoleEnum
}
