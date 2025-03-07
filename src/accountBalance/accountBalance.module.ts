import { Module } from '@nestjs/common'
import { ResetBalanceServce } from './reset-balance.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AccountBalanceController } from './accountBalance.controller'
import { GetRapideBalanceService } from './get-rapide-balance.service'
import { RedisService } from 'src/redis/redis.service'
import { DriverBalanceService } from './driverBalance.service'

@Module({
   imports: [],
   providers: [
      ResetBalanceServce,
      GetRapideBalanceService,
      PrismaService,
      RedisService,
      DriverBalanceService
   ],
   controllers: [AccountBalanceController],
})
export class AccountBalanceModule {}
