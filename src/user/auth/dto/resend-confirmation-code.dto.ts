import { IsEmail } from 'class-validator'

export class ResendEmailConfirmationCodeDto {
   @IsEmail({}, { message: 'Please provide a valid email address' })
   email: string
}
