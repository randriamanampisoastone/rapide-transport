import { Injectable, NotFoundException } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { RideData } from 'interfaces/ride.interface'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class CheckRideService {
   constructor(private readonly redisService: RedisService) {}

   async checkClientRide(
      clientProfileId: string,
   ): Promise<{ data: RideData | undefined; isHaveRide: boolean }> {
      try {
         const ridesKey = await this.redisService.keys(`${RIDE_PREFIX}*`)
         if (!ridesKey.length) {
            return { data: undefined, isHaveRide: false }
         }

         const rideDataList = await this.redisService.mget(ridesKey)

         for (const rideData of rideDataList) {
            if (rideData) {
               const data = JSON.parse(rideData)
               if (
                  data.clientProfileId === clientProfileId &&
                  data.status !==
                     (RideStatus.STOPPED ||
                        RideStatus.CLIENT_GIVE_UP ||
                        RideStatus.COMPLETED ||
                        RideStatus.CANCELLED ||
                        RideStatus.ADMIN_CHECK)
               ) {
                  return { data, isHaveRide: true }
               }
            }
         }
         return { data: undefined, isHaveRide: false }
      } catch (error) {
         // console.error('Error checking client ride:', error)
         // throw new Error(
         //    'Une erreur est survenue lors de la vérification de la course.',
         // )
         throw new NotFoundException(
            'An error occurred while checking the ride.',
         )
      }
   }

   async checkDriverRide(
      driverProfileId: string,
   ): Promise<{ data: RideData | undefined; isHaveRide: boolean }> {
      try {
         const ridesKey = await this.redisService.keys(`${RIDE_PREFIX}*`)

         if (!ridesKey.length) {
            return { data: undefined, isHaveRide: false }
         }

         const rideDataList = await this.redisService.mget(ridesKey)

         for (const rideData of rideDataList) {
            if (rideData) {
               const data = JSON.parse(rideData)
               if (
                  data.driverProfileId === driverProfileId &&
                  data.status !==
                     (RideStatus.COMPLETED || RideStatus.ADMIN_CHECK)
               ) {
                  return { data, isHaveRide: true }
               }
            }
         }
         return { data: undefined, isHaveRide: false }
      } catch (error) {
         // console.error('Error checking driver ride:', error)
         // throw new Error(
         //    'Une erreur est survenue lors de la vérification de la course.',
         // )
         throw new NotFoundException(
            'An error occurred while checking the ride.',
         )
      }
   }
}
