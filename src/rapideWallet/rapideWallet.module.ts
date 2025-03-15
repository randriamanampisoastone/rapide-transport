import { Module } from '@nestjs/common'
import { ResetBalanceServce } from './reset-balance.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { RapideWalletController } from './rapideWallet.controller'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { RedisService } from 'src/redis/redis.service'
import { DriverBalanceService } from './driverBalance.service'
import { Gateway } from 'src/gateway/gateway'
import { LocationService } from 'src/gateway/location/location.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CheckRideService } from 'src/ride/check-ride.service'
import { PasswordController } from './password.controller'
import { PasswordService } from './password.service'
import { SmsService } from 'src/sms/sms.service'
import { RapideWalletService } from './rapide-wallet.service'
import { ConfigService } from '@nestjs/config'

@Module({
   imports: [],
   providers: [
      ResetBalanceServce,
      GetRapideBalanceService,
      PrismaService,
      RedisService,
      DriverBalanceService,
      Gateway,
      LocationService,
      InfoOnRideService,
      CheckRideService,
      PasswordService,
      SmsService,
      RapideWalletService,
      ConfigService,
   ],
   controllers: [RapideWalletController, PasswordController],
})
export class RapideWalletModule {}
