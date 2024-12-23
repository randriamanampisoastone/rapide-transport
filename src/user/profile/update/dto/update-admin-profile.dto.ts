import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateAdminProfileDto {
   @IsOptional()
   @IsNotEmpty({ message: 'First Name should not be empty' })
   @IsString({ message: 'First Name must be a string' })
   firstName?: string

   @IsOptional()
   @IsNotEmpty({ message: 'Last Name should not be empty' })
   @IsString({ message: 'Last Name must be a string' })
   lastName?: string
}
