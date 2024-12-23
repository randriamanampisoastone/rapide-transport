import { IsEmail, IsString, Length } from 'class-validator'

export class ConfirmSignUpDto {
   @IsEmail({}, { message: 'Please provide a valid email address' })
   email: string

   @IsString()
   @Length(6, 6, { message: 'Password must be exactly 6 digits' })
   confirmationCode: string
}
