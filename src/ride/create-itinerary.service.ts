import { Injectable, OnModuleInit } from '@nestjs/common'
import { getRouteGoogleMap } from 'api/route.googlemap'
import { ConfigService } from '@nestjs/config'
import { CreateItineraryDto } from './dto/create-ride.dto'
import { RedisService } from 'src/redis/redis.service'
import { ItineraryData } from 'interfaces/itinerary'
import { VehiclePrices } from 'interfaces/price'

@Injectable()
export class CreateItineraryService implements OnModuleInit {
   private API_KEY = ''

   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService,
   ) {}

   onModuleInit() {
      this.API_KEY = this.configService.get<string>('GOOGLE_MAP_API_KEY')

      if (!this.API_KEY) {
         throw new Error('Google Maps API Key is missing!')
      }
   }
   private calculatePrices(
      distance: number,
      estimatedTimeInMinutes: number,
   ): VehiclePrices {
      const distanceInKm = distance / 1000

      const pricingRules = {
         moto: {
            baseFare: 1000, // Tarif de base
            perKmRate: 3000, // Tarif par kilomètre
            perMinuteRate: 500, // Tarif par minute
            minFare: 5000, // Tarif minimum
            peakHourRate: 1.05, // Augmentation de 5% pendant les heures de pointe
         },
         liteCar: {
            baseFare: 1500,
            perKmRate: 3500,
            perMinuteRate: 700,
            minFare: 6000,
            peakHourRate: 1.08, // Augmentation de 8% pendant les heures de pointe
         },
         premiumCar: {
            baseFare: 2000,
            perKmRate: 4500,
            perMinuteRate: 1000,
            minFare: 10000,
            peakHourRate: 1.1, // Augmentation de 10% pendant les heures de pointe
         },
      }
      const roundToNearestHundred = (value: number): number => {
         return Math.round(value / 100) * 100
      }

      const isPeakHour = () => {
         const now = new Date()
         const hour = now.getHours()
         return (
            (hour >= 7 && hour < 9) || // 7h-9h
            (hour >= 13 && hour < 14) || // 13h-14h
            (hour >= 16 && hour < 18) // 16h-18h
         )
      }

      const calculateRange = (
         baseFare: number,
         perKmRate: number,
         perMinuteRate: number,
         minFare: number,
         peakRate: number,
      ) => {
         // Calcul du coût sans augmentation
         let lowerEstimate = Math.max(
            baseFare +
               perKmRate * distanceInKm +
               perMinuteRate * estimatedTimeInMinutes,
            minFare,
         )
         let upperEstimate = lowerEstimate * 1.2 // Variation de 20%

         // Appliquer le taux des heures de pointe
         if (isPeakHour()) {
            lowerEstimate *= peakRate
            upperEstimate *= peakRate
         }

         return {
            lower: roundToNearestHundred(Math.round(lowerEstimate)),
            upper: roundToNearestHundred(Math.round(upperEstimate)),
         }
      }

      const prices = {
         moto: calculateRange(
            pricingRules.moto.baseFare,
            pricingRules.moto.perKmRate,
            pricingRules.moto.perMinuteRate,
            pricingRules.moto.minFare,
            pricingRules.moto.peakHourRate,
         ),
         liteCar: calculateRange(
            pricingRules.liteCar.baseFare,
            pricingRules.liteCar.perKmRate,
            pricingRules.liteCar.perMinuteRate,
            pricingRules.liteCar.minFare,
            pricingRules.liteCar.peakHourRate,
         ),
         premiumCar: calculateRange(
            pricingRules.premiumCar.baseFare,
            pricingRules.premiumCar.perKmRate,
            pricingRules.premiumCar.perMinuteRate,
            pricingRules.premiumCar.minFare,
            pricingRules.premiumCar.peakHourRate,
         ),
      }

      return prices
   }

   private parseDuration(durationStr: string): number {
      if (typeof durationStr === 'string' && /^[0-9]+s$/.test(durationStr)) {
         return parseInt(durationStr.slice(0, -1), 10)
      } else {
         throw new Error(
            "Invalid duration format. Expected a string ending with 's'.",
         )
      }
   }

   async createItinerary(
      createItineraryDto: CreateItineraryDto,
      clientId: string,
   ): Promise<ItineraryData> {
      try {
         const route = await getRouteGoogleMap(
            createItineraryDto.pickUpLocation,
            createItineraryDto.dropOffLocation,
            this.API_KEY,
         )

         const prices = this.calculatePrices(
            route.distanceMeters,
            this.parseDuration(route.duration) / 60,
         )

         const { duration, polyline, ...routeRest } = route

         this.redisService.set(
            `itinerary:${clientId}`,
            JSON.stringify({
               ...routeRest,
               encodedPolyline: polyline.encodedPolyline,
               prices: prices,
               estimatedDuration: this.parseDuration(duration),
            }),
            120,
         )

         return {
            prices: prices,
            ...routeRest,
            encodedPolyline: polyline.encodedPolyline,
            estimatedDuration: this.parseDuration(duration),
            pickUpLocation: createItineraryDto.pickUpLocation,
            dropOffLocation: createItineraryDto.dropOffLocation,
         }
      } catch (error) {
         throw error
      }
   }
}
