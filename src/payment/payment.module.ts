import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { DepositeService } from './deposite.service'
import { SmsService } from 'src/sms/sms.service'
import { RedisService } from 'src/redis/redis.service'
import { Gateway } from 'src/gateway/gateway'
import { LocationService } from 'src/gateway/location/location.service'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CheckRideService } from 'src/ride/check-ride.service'

import { TransferController } from './transfer.controller'
import { TransferService } from './transfer.service'

import { RidePaymentController } from './ride-payment/ride-payment.controller'
import { RidePaymentService } from './ride-payment/ride-payment.service'
import { TransactionController } from './transaction.controller'
import { GetTransactionService } from './get-transacation.service'
import { NotificationService } from 'src/notification/notification.service'

@Module({
   controllers: [
      TransactionController,
      TransferController,
      RidePaymentController,
   ],
   providers: [
      DepositeService,
      PrismaService,
      SmsService,
      RedisService,
      Gateway,
      LocationService,
      NotificationService,
      InfoOnRideService,
      CheckRideService,
      TransferService,
      RidePaymentService,
      GetTransactionService,
   ],
})
export class PaymentModule {}
