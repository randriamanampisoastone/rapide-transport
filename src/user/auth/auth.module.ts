import { Module } from '@nestjs/common'
import { SignUpService } from './sign.up.service'
import { AuthController } from './auth.controller'
import { SignInService } from './sign.in.service'
import { ConfirmSignUpService } from './confirm.sign.up.service'
import { RedisService } from 'src/redis/redis.service'
import { SmsService } from 'src/sms/sms.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import {
   jwtAdminConfig,
   jwtClientConfig,
   jwtDriverConfig,
} from 'src/jwt/jwt.config'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfirmSignInService } from './confirm.sign.in.service'
import { ResendConfirmSignUpService } from './resend.confirm.sign.up.service'
import { ResendConfirmSignInService } from './resend.confirm.sign.in.service'
import { GetProfileService } from './get.profile.service'
import { GoogleAuthService } from './google.auth.service'

@Module({
   imports: [
      JwtModule.registerAsync(jwtClientConfig),
      JwtModule.registerAsync(jwtDriverConfig),
      JwtModule.registerAsync(jwtAdminConfig),
   ],
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
      GoogleAuthService,

      {
         provide: 'jwtClient',
         useExisting: JwtService,
      },
      {
         provide: 'jwtDriver',
         useExisting: JwtService,
      },
      {
         provide: 'jwtAdmin',
         useExisting: JwtService,
      },
   ],
   exports: ['jwtClient', 'jwtDriver', 'jwtAdmin'],
})
export class AuthModule {}
