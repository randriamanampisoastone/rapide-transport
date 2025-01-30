import { Module } from '@nestjs/common'
import { SignUpService } from './sign.up.service'
import { AuthController } from './auth.controller'
import { SignInService } from './sign.in.service'
import { ConfirmSignUpService } from './confirm.sign.up.service'
import { RedisService } from 'src/redis/redis.service'
import { SmsService } from 'src/sms/sms.service'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig } from 'src/jwt/jwt.config'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfirmSignInService } from './confirm.sign.in.service'
import { ResendConfirmSignUpService } from './resend.confirm.sign.up.service'
import { ResendConfirmSignInService } from './resend.confirm.sign.in.service'
import { GetProfileService } from './get.profile.service'

@Module({
   imports: [JwtModule.registerAsync(jwtConfig)],
   controllers: [AuthController],
   providers: [
      RedisService,
      SmsService,
      PrismaService,
      SignUpService,
      ConfirmSignUpService,
      ResendConfirmSignUpService,
      SignInService,
      ConfirmSignInService,
      ResendConfirmSignInService,
      GetProfileService,
   ],
})
export class AuthModule {}
