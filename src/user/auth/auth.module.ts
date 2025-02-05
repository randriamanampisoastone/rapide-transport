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
import { GoogleAuthService } from './google.auth.service'
import { DynamooseModule } from 'nestjs-dynamoose'
import { RideModel } from 'src/ride/Model/ride.model'
import { GetByStatusService } from 'src/ride/get-by-status.service'

@Module({
   imports: [
      JwtModule.registerAsync(jwtConfig),
      // DynamooseModule.forFeature([RideModel]),
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
      // GetByStatusService,
   ],
})
export class AuthModule {}
