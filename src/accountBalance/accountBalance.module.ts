import { Module } from '@nestjs/common'
import { ResetBalanceServce } from './reset-balance.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AccountBalanceController } from './accountBalance.controller'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { RedisService } from 'src/redis/redis.service'
import { DriverBalanceService } from './driverBalance.service'
import { ClientBalanceService } from './client-balance.service'
import { Gateway } from 'src/gateway/gateway'
import { LocationService } from 'src/gateway/location/location.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CheckRideService } from 'src/ride/check-ride.service'

@Module({
   imports: [],
   providers: [
      ResetBalanceServce,
      GetRapideBalanceService,
      PrismaService,
      RedisService,
      DriverBalanceService,
      ClientBalanceService,
      Gateway,
      LocationService,
      InfoOnRideService,
      CheckRideService,
   ],
   controllers: [AccountBalanceController],
})
export class AccountBalanceModule {}
