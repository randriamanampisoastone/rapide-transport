import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentWithRapideWalletService } from './payment-with-rapide-wallet.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { Gateway } from 'src/gateway/gateway'
import { LocationService } from 'src/gateway/location/location.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CheckRideService } from 'src/ride/check-ride.service'
import { RedisService } from 'src/redis/redis.service'
import { TransactionService } from './transaction.service'

@Module({
   controllers: [PaymentController],
   providers: [
      PaymentWithRapideWalletService,
      PrismaService,
      Gateway,
      LocationService,
      InfoOnRideService,
      CheckRideService,
      RedisService,
      TransactionService,
   ],
})
export class PaymentModule {}
