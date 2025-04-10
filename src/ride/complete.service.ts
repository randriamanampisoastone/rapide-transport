/* eslint-disable @typescript-eslint/no-unused-vars */
import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common'
import { MethodType, Services } from '@prisma/client'
import { EVENT_RIDE_COMPLETED } from 'constants/event.constant'
import {
   CLIENT_PROMOTION_CODE_PREFIX,
   RIDE_PREFIX,
} from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { RidePaymentService } from 'src/payment/ride-payment/ride-payment.service'
import { UserRole } from 'enums/profile.enum'
import { PromotionCodeService } from 'src/promotion-code/promotion-code.service'
import { EstimatedPrice } from 'interfaces/price.interface'
import { roundToNearestThousand } from 'utils/roundToNearestThousand.utils'

export interface CompleteDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class CompleteService {
   constructor(
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
      private readonly ridePaymentService: RidePaymentService,
      private readonly promotionCodeService: PromotionCodeService,
   ) {}
   async complete(completeDto: CompleteDto, locale: string) {
      try {
         const rideId = completeDto.rideId
         const driverProfileId = completeDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.ARRIVED_DESTINATION) {
            // throw new Error('Ride is not in ARRIVED_DESTINATION status')
            throw new BadRequestException(
               'Ride is not in ARRIVED_DESTINATION status',
            )
         }
         if (rideData.driverProfileId !== driverProfileId) {
            // throw new Error('Driver is not the driver of the ride')
            throw new ForbiddenException('Driver is not the driver of the ride')
         }

         // Applay promotionCode
         const usedPromotionCode =
            await this.promotionCodeService.getUsedClientPromotionServiceInRedis(
               rideData.clientProfileId,
            )
         console.log(usedPromotionCode)
         if (
            usedPromotionCode !== null &&
            usedPromotionCode.promotionService.serviceFor === Services.RIDE &&
            usedPromotionCode.promotionService.vehicleType ===
               rideData.vehicleType
         ) {
            rideData.estimatedPrice.upper = roundToNearestThousand(
               rideData.estimatedPrice.upper *
                  usedPromotionCode.promotionService.value,
            )
            rideData.realPrice = roundToNearestThousand(
               rideData.realPrice * usedPromotionCode.promotionService.value,
            )
            await this.redisService.remove(
               `${CLIENT_PROMOTION_CODE_PREFIX}-${rideData.clientProfileId}`,
            )
            await this.promotionCodeService.addClientPhoneNumberOnPromotionService(
               usedPromotionCode.phoneNumber,
               usedPromotionCode.promotionService.promotionServiceId,
            )
         }

         const updatedRideData = await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               estimatedPrice: JSON.stringify({
                  lower: rideData.estimatedPrice.lower,
                  upper: rideData.estimatedPrice.upper,
               } as EstimatedPrice),
               status: RideStatus.COMPLETED,
               realDuration: rideData.realDuration,
               realPrice: Math.round(rideData.realPrice),
            },
         })

         await this.prismaService.driverProfile.update({
            where: {
               driverProfileId,
            },
            data: {
               completeRide: {
                  increment: 1,
               },
            },
         })

         await this.prismaService.clientProfile.update({
            where: {
               clientProfileId: rideData.clientProfileId,
            },
            data: {
               completeRide: {
                  increment: 1,
               },
            },
         })

         // await this.driverBalanceService.increaseBalance(
         //    rideData.driverProfileId,
         //    Math.round(rideData.realPrice),
         // )

         const rideInvoice = await this.prismaService.rideInvoice.create({
            data: {
               distanceMeters: rideData.distanceMeters,
               methodType: rideData.methodType,
               vehicleType: rideData.vehicleType,
               driverProfileId: rideData.driverProfileId,
               clientProfileId: rideData.clientProfileId,
               realPrice: rideData.realPrice,
               realDuration: rideData.realDuration,
               startTime: rideData.startTime,
               pickUpLatitude: rideData.pickUpLocation.latitude,
               pickUpLongitude: rideData.pickUpLocation.longitude,
               dropOffLatitude: rideData.dropOffLocation.latitude,
               dropOffLongitude: rideData.dropOffLocation.longitude,
               status: RideStatus.COMPLETED,
               endTime: updatedRideData.endTime,
               promotionServiceId: usedPromotionCode
                  ? usedPromotionCode.promotionService.promotionServiceId
                  : null,
            },
         })

         // Payment
         console.log(rideData.methodType)
         if (rideData.methodType === MethodType.CASH) {
            console.log(
               rideData.clientProfileId,
               rideData.driverProfileId,
               rideInvoice.rideInvoiceId,
               Math.round(rideData.realPrice),
            )
            await this.ridePaymentService.cashPayment(
               rideData.clientProfileId,
               rideData.driverProfileId,
               rideInvoice.rideInvoiceId,
               Math.round(rideData.realPrice),
            )
         } else if (rideData.methodType === MethodType.RAPIDE_WALLET) {
            await this.ridePaymentService.processPaymentWithRapideWallet(
               rideInvoice.rideInvoiceId,
               rideData.clientProfileId,
               Math.round(rideData.realPrice),
               locale,
            )
         }

         const dailyRideComplet = await this.redisService.newDailyRideComplet(
            rideData.rideId,
         )
         this.gateway.sendNotificationToAdmin(
            [UserRole.RIDER, UserRole.CALL_CENTER, UserRole.MANAGER_HUB],
            EVENT_RIDE_COMPLETED,
            {
               rideId: rideData.rideId,
               ...dailyRideComplet,
            },
         )

         await this.redisService.remove(`${RIDE_PREFIX + rideId}`)

         console.log('red completed and successfully deleted')
         return { ...rideData }
      } catch (error) {
         throw new InternalServerErrorException('Error completing ride')
      }
   }
}
