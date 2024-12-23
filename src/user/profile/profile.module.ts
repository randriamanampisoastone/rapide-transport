import { Module } from '@nestjs/common'
import { CreateProfileModule } from './create/create.profile.module'
import { FindProfileModule } from './find/find.profile.module'
import { UpdateProfileModule } from './update/update.profile.module'

@Module({
   imports: [CreateProfileModule, FindProfileModule, UpdateProfileModule],
   controllers: [],
   providers: [],
})
export class ProfileModule {}
