import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ProfileModule } from './profile/profile.module'
import { AddressModule } from './address/address.module'
import { VehicleModule } from './vehicle/vehicle.module'
import { ScheduleModule } from './schedule/schedule.module'

@Module({
   imports: [
      AuthModule,
      ProfileModule,
      AddressModule,
      VehicleModule,
      ScheduleModule,
   ],
})
export class UserModule {}
