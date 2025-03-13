import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { InitRapideWalletPayment } from './dto/initRapideWalletPayment.dto'
import * as bcrypt from 'bcrypt'
import * as speakeasy from 'speakeasy'
import { SmsService } from 'src/sms/sms.service'
import { GenderType } from 'enums/profile.enum'
import { PaymentRideWalletInterface } from 'interfaces/payment.ride.wallet.interface'
import { RedisService } from 'src/redis/redis.service'
import { PAYMENT_VALIDATION } from 'constants/redis.constant'

@Injectable()
export class RidePaymentService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly smsService: SmsService,
      private readonly redisService: RedisService,
   ) {}

   async initRapideWalletPayment(
      clientProfileId: string,
      initRapideWalletPayment: InitRapideWalletPayment,
   ) {
      try {
         const clientProfile =
            await this.prismaService.clientProfile.findUnique({
               where: { clientProfileId },
               select: {
                  walletPassword: true,
                  profile: {
                     select: {
                        gender: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                     },
                  },
               },
            })
         if (!clientProfile) {
            throw new NotFoundException('Client not found')
         }
         const isMatch = await bcrypt.compare(
            initRapideWalletPayment.walletPassword,
            clientProfile.walletPassword,
         )
         if (!isMatch) {
            throw new BadRequestException('Password incorrect')
         }
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         const paymentValidation: PaymentRideWalletInterface = {
            code: confirmationCode,
            from: clientProfileId,
            to: '',
            rideId: '',
            amount: 0,
         }
         await this.redisService.set(
            `${PAYMENT_VALIDATION}-${clientProfileId}`,
            JSON.stringify(paymentValidation),
         )
         await this.smsService.sendSMS(
            [clientProfile.profile.phoneNumber],
            `Dear ${clientProfile.profile.gender === GenderType.FEMALE ? 'Ms.' : 'Mr.'} ${clientProfile.profile.lastName} ${clientProfile.profile.firstName}, your transaction code is : ${confirmationCode}`,
         )
      } catch (error) {
         throw error
      }
   }
}
