import { Injectable } from '@nestjs/common'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class CheckRideService {
   constructor(private readonly redisService: RedisService) {}

   async checkClientRide(clientProfileId: string) {
      try {
         const rideKeys = await this.redisService.keys(`${RIDE_PREFIX}*`)

         if (!rideKeys.length) {
            return null
         }

         const rideDataList = await this.redisService.mget(rideKeys)

         for (const rideData of rideDataList) {
            if (rideData) {
               const data = JSON.parse(rideData)
               if (data.clientProfileId === clientProfileId) {
                  return data
               }
            }
         }
         return null
      } catch (error) {
         console.error('Error checking client ride:', error)
         throw new Error(
            'Une erreur est survenue lors de la vérification de la course.',
         )
      }
   }

   async checkDriverRide(driverProfileId: string) {
      try {
         const rideKeys = await this.redisService.keys(`${RIDE_PREFIX}*`)

         if (!rideKeys.length) {
            return null
         }

         const rideDataList = await this.redisService.mget(rideKeys)

         for (const rideData of rideDataList) {
            if (rideData) {
               const data = JSON.parse(rideData)
               if (data.driverProfileId === driverProfileId) {
                  return data
               }
            }
         }
         return null
      } catch (error) {
         console.error('Error checking driver ride:', error)
         throw new Error(
            'Une erreur est survenue lors de la vérification de la course.',
         )
      }
   }
}
