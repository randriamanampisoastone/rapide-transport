import { Controller, Post, Body, Get, Query } from '@nestjs/common'
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
import { GetProfileService } from './get.profile.service'

@Controller('auth')
export class AuthController {
   constructor(
      private readonly signUpService: SignUpService,
      private readonly confirmSignUpService: ConfirmSignUpService,
      private readonly resendConfirmSignUpService: ResendConfirmSignUpService,
      private readonly signInService: SignInService,
      private readonly confirmSignInService: ConfirmSignInService,
      private readonly resendConfirmSignInService: ResendConfirmSignInService,
      private readonly getProfileService: GetProfileService,
   ) {}

   @Post('signUp')
   async signUp(
      @Body()
      signUpDto: SignUpDto,
   ) {
      console.log(signUpDto)
      return await this.signUpService.signUp(signUpDto)
   }
   @Post('confirmSignUp')
   async confirmSignUp(
      @Body()
      confirmSignUpDto: ConfirmDto,
   ) {
      return await this.confirmSignUpService.confirmSignUp(confirmSignUpDto)
   }
   @Post('resendConfirmSignUp')
   async resendConfirmSignUp(
      @Body()
      resendConfirmDto: ResendConfirmDto,
   ) {
      console.log(resendConfirmDto)

      return await this.resendConfirmSignUpService.resendConfirmSignUp(
         resendConfirmDto,
      )
   }
   @Post('signIn')
   async signIn(
      @Body()
      signInDto: SignInDto,
   ) {
      return await this.signInService.signIn(signInDto)
   }
   @Post('confirmSignIn')
   async confirmSignIn(
      @Body()
      confirmSignInDto: ConfirmDto,
   ) {
      return await this.confirmSignInService.confirmSignIn(confirmSignInDto)
   }
   @Post('resendConfirmSignIn')
   async resendConfirmSignIn(
      @Body()
      resendConfirmDto: ResendConfirmDto,
   ) {
      return await this.resendConfirmSignInService.resendConfirmSignIn(
         resendConfirmDto,
      )
   }

   @Get('getClientProfile')
   async getClientProfile(
      @Query('clientProfileId')
      clientProfileId: string,
   ) {
      return await this.getProfileService.getClientProfile(clientProfileId)
   }

   @Get('getDriverProfile')
   async getDriverProfile(
      @Query('driverProfileId')
      driverProfileId: string,
   ) {
      return await this.getProfileService.getDriverProfile(driverProfileId)
   }
}
