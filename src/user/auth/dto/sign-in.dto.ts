import { IsEmail, IsString, Matches, MinLength } from 'class-validator'

export class SignInDto {
   @IsEmail({}, { message: 'Please provide a valid email address' })
   email: string

   @IsString({ message: 'Password must be a string' })
   @MinLength(8, { message: 'Password must be at least 8 characters long' })
   @Matches(/[A-Z]/, {
      message: 'Password must include at least one uppercase letter',
   })
   @Matches(/[a-z]/, {
      message: 'Password must include at least one lowercase letter',
   })
   @Matches(/\d/, { message: 'Password must include at least one number' })
   @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must include at least one special character',
   })
   password: string
}

export class RefreshTokenDto {
   @IsString({ message: 'Password must be a string' })
   refreshToken: string
}

export class RefreshTokenResponse {
   accessToken: string
   idToken: string
}

export class SignInResponse extends RefreshTokenResponse {
   refreshToken: string
}
