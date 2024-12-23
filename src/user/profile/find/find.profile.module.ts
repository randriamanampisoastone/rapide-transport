import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { FindProfileController } from './find.profile.controller'
import { FindClientProfileService } from './find.client.profile..service'
import { FindProviderProfileService } from './find.provider.profile.service'
import { FindDriverProfileService } from './find.driver.profile.service'

@Module({
   imports: [PrismaModule],
   controllers: [FindProfileController],
   providers: [
      FindClientProfileService,
      FindProviderProfileService,
      FindDriverProfileService,
   ],
})
export class FindProfileModule {}
