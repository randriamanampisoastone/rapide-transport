import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { SignUpService } from './sign-up.service'
import { SignUpDto } from './dto/sign-up.dto'
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto'
import { ConfirmSignUpService } from './confirm-sign-up.service'
import { SignInService } from './sign-in.service'
import { RefreshTokenDto, SignInDto } from './dto/sign-in.dto'
import { ResendEmailConfirmationCodeDto } from './dto/resend-confirmation-code.dto'

@Controller('auth')
export class AuthController {
   constructor(
      private readonly signUpService: SignUpService,
      private readonly confirmSignUpService: ConfirmSignUpService,
      private readonly signInService: SignInService,
   ) {}

   @Post('signUp')
   async signUp(
      @Body()
      signUpDto: SignUpDto,
   ) {
      return await this.signUpService.signUp(signUpDto)
   }
   @Post('confirmSignUp')
   async confirmSignUp(
      @Body()
      confirmSignUpDto: ConfirmSignUpDto,
   ) {
      return await this.confirmSignUpService.confirmSignUp(confirmSignUpDto)
   }
   @Post('resendEmailConfirmationCode')
   async resendEmailConfirmationCode(
      @Body()
      resendConfirmationCode: ResendEmailConfirmationCodeDto,
   ) {
      return await this.confirmSignUpService.resendEmailConfirmationCode(
         resendConfirmationCode,
      )
   }
   @Post('signIn')
   async signIn(
      @Body()
      signInDto: SignInDto,
   ) {
      return await this.signInService.signIn(signInDto)
   }
   @Get('refreshToken')
   async refreshToken(@Query('refreshToken') refreshToken: string) {
      return await this.signInService.refreshToken({
         refreshToken,
      } as RefreshTokenDto)
   }
}
