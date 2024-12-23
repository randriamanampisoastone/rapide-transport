import { Injectable, OnModuleInit } from '@nestjs/common'
import { getRouteGoogleMap } from 'api/route.googlemap'
import { ConfigService } from '@nestjs/config'
import { CreateItineraryDto } from './dto/create-ride.dto'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class CreateItineraryService implements OnModuleInit {
   private API_KEY = ''
   private RIDE_MOTO_PER_KM = 0
   private RIDE_LITE_CAR_PER_KM = 0
   private RIDE_PREMIUM_CAR_PER_KM = 0
   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService,
   ) {}

   onModuleInit() {
      this.API_KEY = this.configService.get<string>('GOOGLE_MAP_API_KEY')
      this.RIDE_MOTO_PER_KM = this.configService.get<number>('RIDE_MOTO_PER_KM')
      this.RIDE_LITE_CAR_PER_KM = this.configService.get<number>(
         'RIDE_LITE_CAR_PER_KM',
      )
      this.RIDE_PREMIUM_CAR_PER_KM = this.configService.get<number>(
         'RIDE_PREMIUM_CAR_PER_KM',
      )

      if (!this.API_KEY) {
         throw new Error('Google Maps API Key is missing!')
      }
   }
   private calculatePrices(distance: number) {
      const distanceInKm = distance / 1000
      const multiplier = Math.max(1, Math.floor(distanceInKm))

      const prices = {
         moto: this.RIDE_MOTO_PER_KM * multiplier,
         liteCar: this.RIDE_LITE_CAR_PER_KM * multiplier,
         premiumCar: this.RIDE_PREMIUM_CAR_PER_KM * multiplier,
      }
      return prices
   }

   async createItinerary(createItineraryDto: CreateItineraryDto) {
      try {
         const route = await getRouteGoogleMap(
            createItineraryDto.pickUpLocation,
            createItineraryDto.dropOffLocation,
            this.API_KEY,
         )
         const prices = this.calculatePrices(route.distanceMeters)
         let duration: number
         const { duration: durationStr, ...routeRest } = route
         if (typeof durationStr === 'string' && durationStr.endsWith('s')) {
            duration = parseInt(durationStr.slice(0, -1), 10)
         }
         this.redisService.set(
            `itinerary:${createItineraryDto.clientId}`,
            JSON.stringify({
               ...routeRest,
               prices: prices,
               duration: duration,
            }),
            120,
         )
         return { prices: prices, ...routeRest, duration: duration }
      } catch (error) {
         throw error
      }
   }
}
