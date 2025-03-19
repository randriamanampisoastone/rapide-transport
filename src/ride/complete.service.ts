/* eslint-disable @typescript-eslint/no-unused-vars */
import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common'
import { MethodType } from '@prisma/client'
import { EVENT_RIDE_COMPLETED } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { DriverBalanceService } from 'src/rapideWallet/driverBalance.service'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { RidePaymentService } from 'src/payment/ride-payment/ride-payment.service'

export interface CompleteDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class CompleteService {
   constructor(
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly driverBalanceService: DriverBalanceService,
      private readonly prismaService: PrismaService,
      private readonly ridePaymentService: RidePaymentService,
   ) {}
   async complete(completeDto: CompleteDto) {
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

         const updatedRideData = await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
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

         const {
            pickUpLocation,
            dropOffLocation,
            estimatedPrice,
            rideId: rideInvoiceId,
            estimatedDuration,
            review,
            note,
            clientProfileId,
            ...rideDataRest
         } = rideData
         const rideInvoice = await this.prismaService.rideInvoice.create({
            data: {
               rideInvoiceId,
               ...rideDataRest,
               pickUpLatitude: pickUpLocation.latitude,
               pickUpLongitude: pickUpLocation.longitude,
               dropOffLatitude: dropOffLocation.latitude,
               dropOffLongitude: dropOffLocation.longitude,
               status: RideStatus.COMPLETED,
               endTime: updatedRideData.endTime,
            },
         })

         // Payment

         // if (rideData.methodType === MethodType.CASH) {
         //    await this.ridePaymentService.cashPayment(
         //       rideData.clientProfileId,
         //       rideData.driverProfileId,
         //       Math.round(rideData.realPrice),
         //    )
         // } else if (rideData.methodType === MethodType.RAPIDE_WALLET) {
         //    await this.ridePaymentService.processPaymentWithRapideWallet(
         //       rideInvoice.rideInvoiceId,
         //       rideData.clientProfileId,
         //       Math.round(rideData.realPrice),
         //    )
         // }

         const dailyRideComplet = await this.redisService.newDailyRideComplet(
            rideData.rideId,
         )
         this.gateway.sendNotificationToAdmin(EVENT_RIDE_COMPLETED, {
            rideId: rideData.rideId,
            ...dailyRideComplet,
         })

         await this.redisService.remove(`${RIDE_PREFIX + rideId}`)

         return { ...rideData }
      } catch (error) {
         // console.log('Error completing ride:', error)
         throw new InternalServerErrorException('Error completing ride')
      }
   }
}
