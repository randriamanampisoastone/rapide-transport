import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { CreateProfileController } from './create.profile.controller'
import { CreateClientProfileService } from './create.client.profile.service'
import { CreateProviderProfileService } from './create.provider.profile.service'
import { CreateDriverProfileService } from './create.driver.profile.service'
import { CreateAdminProfileService } from './create.admin.profile.service'

@Module({
   imports: [PrismaModule],
   controllers: [CreateProfileController],
   providers: [
      CreateClientProfileService,
      CreateProviderProfileService,
      CreateDriverProfileService,
      CreateAdminProfileService,
   ],
})
export class CreateProfileModule {}
