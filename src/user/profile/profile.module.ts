import { Module } from '@nestjs/common'
import { GetProfileService } from './get.profile.service'
import { ProfileController } from './profile.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { GoogleAuthService } from '../auth/google.auth.service'
import { UpdateProfileService } from './update.profile.service'
import { DeleteProfileService } from './delete.profile.service'

@Module({
   imports: [],
   controllers: [ProfileController],
   providers: [
      GetProfileService,
      PrismaService,
      RedisService,
      GoogleAuthService,
      UpdateProfileService,
      DeleteProfileService
   ],
})
export class ProfileModule {}
