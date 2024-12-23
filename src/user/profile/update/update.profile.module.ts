import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UpdateProfileController } from './update.profile.controller'
import { UpdateProfileService } from './update.profile.service'

@Module({
   imports: [PrismaModule],
   controllers: [UpdateProfileController],
   providers: [UpdateProfileService],
})
export class UpdateProfileModule {}
