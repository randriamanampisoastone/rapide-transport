import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { UserRole } from 'enums/profile.enum'

export class UpdateAdminRoleDto {
   @IsString()
   @IsNotEmpty()
   adminProfileId: string

   @IsEnum(UserRole)
   @IsNotEmpty()
   role: UserRole
}
