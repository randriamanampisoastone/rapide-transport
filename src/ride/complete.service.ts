import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { EVENT_RIDE_COMPLETED } from 'constants/event.constant'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { DriverBalanceService } from 'src/accountBalance/driverBalance.service'
import { Gateway } from 'src/gateway/gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

export interface CompleteDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class CompleteService {
   constructor(
      private readonly gateway: Gateway,
      private redisService: RedisService,
      private readonly driverBalanceService: DriverBalanceService,
      private readonly prismaService: PrismaService,
   ) {}
   async complete(completeDto: CompleteDto) {
      try {
         const rideId = completeDto.rideId
         const driverProfileId = completeDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.ARRIVED_DESTINATION) {
            throw new Error('Ride is not in ARRIVED_DESTINATION status')
         }
         if (rideData.driverProfileId !== driverProfileId) {
            throw new Error('Driver is not the driver of the ride')
         }

         await this.prismaService.ride.update({
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
            }
         })

         await this.driverBalanceService.increaseBalance(
            rideData.driverProfileId,
            Math.round(rideData.realPrice),
         )

         const {
            pickUpLocation,
            dropOffLocation,
            estimatedPrice,
            rideId: rideInvoiceId,
            ...rideDataRest
         } = rideData
         await this.prismaService.rideInvoice.create({
            data: {
               rideInvoiceId,
               ...rideDataRest,
               pickUpLatitude: pickUpLocation.latitude,
               pickUpLongitude: pickUpLocation.longitude,
               dropOffLatitude: dropOffLocation.latitude,
               dropOffLongitude: dropOffLocation.longitude,
               estimatedPriceLower: estimatedPrice.lower,
               estimatedPriceUpper: estimatedPrice.upper,
               status: RideStatus.COMPLETED,
            },
         })

         const dailyRideComplet = await this.redisService.newDailyRideComplet(
            rideData.rideId,
         )
         this.gateway.sendNotificationToAdmin(EVENT_RIDE_COMPLETED, {
            rideId: rideData.rideId,
            ...dailyRideComplet,
         })

         await this.redisService.remove(`${RIDE_PREFIX + rideId}`)
         console.log('Ride completed successfully')

         return { ...rideData }
      } catch (error) {
         console.log('Error completing ride:', error)
         throw new InternalServerErrorException('Error completing ride')
      }
   }
}
