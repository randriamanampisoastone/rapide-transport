import { Controller, Post, Body } from '@nestjs/common'
import { SignUpService } from './sign.up.service'
import { SignUpDto } from './dto/sign.up.dto'
import { ConfirmSignUpService } from './confirm.sign.up.service'
import { ConfirmDto } from './dto/confirm.dto'
import { SignInService } from './sign.in.service'
import { SignInDto } from './dto/sign.in.dto'
import { ConfirmSignInService } from './confirm.sign.in.service'
import { ResendConfirmSignInService } from './resend.confirm.sign.in.service'
import { ResendConfirmSignUpService } from './resend.confirm.sign.up.service'
import { ResendConfirmDto } from './dto/resend.confirm.dto'
import { GoogleAuthService } from './google.auth.service'
import { UserRole } from 'enums/profile.enum'
import { ROUTE_AUTH } from 'routes/main-routes'
import {
   ROUTE_CONFIRM_SIGN_IN,
   ROUTE_CONFIRM_SIGN_UP,
   ROUTE_GOOGLE_AUTH,
   ROUTE_RESEND_CONFIRM_SIGN_IN,
   ROUTE_RESEND_CONFIRM_SIGN_UP,
   ROUTE_SIGN_IN,
   ROUTE_SIGN_UP,
} from 'routes/secondary-routes'
import { GoogleAuthDto } from './dto/google.auth.dto'

@Controller(ROUTE_AUTH)
export class AuthController {
   constructor(
      private readonly signUpService: SignUpService,
      private readonly confirmSignUpService: ConfirmSignUpService,
      private readonly resendConfirmSignUpService: ResendConfirmSignUpService,
      private readonly signInService: SignInService,
      private readonly confirmSignInService: ConfirmSignInService,
      private readonly resendConfirmSignInService: ResendConfirmSignInService,
      private readonly googleAuthService: GoogleAuthService,
   ) {}

   @Post(ROUTE_SIGN_UP)
   async signUp(
      @Body()
      signUpDto: SignUpDto,
   ) {
      return await this.signUpService.signUp(signUpDto)
   }
   @Post(ROUTE_CONFIRM_SIGN_UP)
   async confirmSignUp(
      @Body()
      confirmSignUpDto: ConfirmDto,
   ) {
      return await this.confirmSignUpService.confirmSignUp(confirmSignUpDto)
   }
   @Post(ROUTE_RESEND_CONFIRM_SIGN_UP)
   async resendConfirmSignUp(
      @Body()
      resendConfirmDto: ResendConfirmDto,
   ) {
      return await this.resendConfirmSignUpService.resendConfirmSignUp(
         resendConfirmDto,
      )
   }
   @Post(ROUTE_SIGN_IN)
   async signIn(
      @Body()
      signInDto: SignInDto,
   ) {
      console.log('signInDto : ', signInDto)

      return await this.signInService.signIn(signInDto)
   }
   @Post(ROUTE_CONFIRM_SIGN_IN)
   async confirmSignIn(
      @Body()
      confirmSignInDto: ConfirmDto,
   ) {
      return await this.confirmSignInService.confirmSignIn(confirmSignInDto)
   }
   @Post(ROUTE_RESEND_CONFIRM_SIGN_IN)
   async resendConfirmSignIn(
      @Body()
      resendConfirmDto: ResendConfirmDto,
   ) {
      return await this.resendConfirmSignInService.resendConfirmSignIn(
         resendConfirmDto,
      )
   }
   @Post(ROUTE_GOOGLE_AUTH)
   async googleAuth(@Body() data: GoogleAuthDto) {
      return await this.googleAuthService.googleAuth(
         data.idToken,
         data.userRole,
         data.locale,
      )
   }
}
