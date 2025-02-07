import {
   Controller,
   Post,
   Body,
   Get,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
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
import { RolesGuard } from 'src/jwt/roles.guard'
import { GoogleAuthService } from './google.auth.service'

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
      private readonly googleAuthService: GoogleAuthService,
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

   @Get('getFullClientProfile')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getFullClientProfile(
      @Query('clientProfileId')
      clientProfileId: string,
   ) {
      return await this.getProfileService.getFullClientProfile(clientProfileId)
   }

   @Get('getClients')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getClients(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getClients(page || 1, pageSize || 10)
   }

   @Get('searchClientByTerm')
   // @SetMetadata('allowedRole', ['ADMIN'])
   // @UseGuards(RolesGuard)
   async searchClientByTerm(
      @Query('term') term: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.searchClientByTerm(
         term,
         page || 1,
         pageSize || 10,
      )
   }

   @Get('getDriverProfile')
   async getDriverProfile(
      @Query('driverProfileId')
      driverProfileId: string,
   ) {
      return await this.getProfileService.getDriverProfile(driverProfileId)
   }

   @Get('getFullDriverProfile')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getFullDriverProfile(
      @Query('driverProfileId')
      driverProfileId: string,
   ) {
      return await this.getProfileService.getFullDriverProfile(driverProfileId)
   }

   @Get('getDrivers')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getDrivers(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getDrivers(page || 1, pageSize || 10)
   }

   @Get('searchDriverByTerm')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async searchDriverByTerm(
      @Query('term') term: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.searchDriverByTerm(
         term,
         page || 1,
         pageSize || 10,
      )
   }

   @Post('googleAuth')
   async googleAuth(
      @Body()
      data: {
         idToken: string
      },
   ) {
      return await this.googleAuthService.googleAuth(data.idToken)
   }
}
