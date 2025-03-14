import { Module } from '@nestjs/common'
import { PasswordController } from './password.controller'
import { PasswordService } from './password.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { PaymentController } from './payment.controller'
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

@Module({
   controllers: [
      PasswordController,
      PaymentController,
      TransferController,
      RidePaymentController,
   ],
   providers: [
      PasswordService,
      DepositeService,
      PrismaService,
      SmsService,
      RedisService,
      Gateway,
      LocationService,
      InfoOnRideService,
      CheckRideService,
      TransferService,
      RidePaymentService,
   ],
})
export class PaymentModule {}
