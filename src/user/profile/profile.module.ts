import { Module } from '@nestjs/common'
import { GetProfileService } from './get.profile.service'
import { ProfileController } from './profile.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { GoogleAuthService } from '../auth/sso/google.auth.service'
import { UpdateProfileService } from './update.profile.service'
import { DeleteProfileService } from './delete.profile.service'
import { DeleteProfileController } from './delete.profile.controller'
import { Gateway } from 'src/gateway/gateway'
import { SmsService } from 'src/sms/sms.service'
import { LocationService } from 'src/gateway/location/location.service'
import { NotificationService } from 'src/notification/notification.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'

@Module({
   imports: [],
   controllers: [ProfileController, DeleteProfileController],
   providers: [
      GetProfileService,
      PrismaService,
      RedisService,
      GoogleAuthService,
      UpdateProfileService,
      DeleteProfileService,
      Gateway,
      SmsService,
      LocationService,
      NotificationService,
      InfoOnRideService,
   ],
})
export class ProfileModule {}
