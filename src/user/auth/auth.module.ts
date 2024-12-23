import { Module } from '@nestjs/common'
import { SignUpService } from './sign-up.service'
import { AuthController } from './auth.controller'
import { ConfirmSignUpService } from './confirm-sign-up.service'
import { SignInService } from './sign-in.service'

@Module({
   controllers: [AuthController],
   providers: [SignUpService, ConfirmSignUpService, SignInService],
})
export class AuthModule {}
