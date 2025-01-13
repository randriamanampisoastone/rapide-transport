import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ProfileModule } from './profile/profile.module'
import { AddressModule } from './address/address.module'
import { ScheduleModule } from './schedule/schedule.module'

@Module({
   imports: [AuthModule, ProfileModule, AddressModule, ScheduleModule],
})
export class UserModule {}
