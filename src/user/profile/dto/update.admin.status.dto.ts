import { ProfileStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class UpdateAdminStatusDto {
   @IsString()
   @IsNotEmpty()
   adminProfileId: string

   @IsEnum(ProfileStatus)
   @IsNotEmpty()
   status: ProfileStatus
}
