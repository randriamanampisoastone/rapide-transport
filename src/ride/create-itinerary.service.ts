import { Injectable, OnModuleInit } from '@nestjs/common'
import { getRouteGoogleMap } from 'api/route.googlemap'
import { ConfigService } from '@nestjs/config'
import { CreateItineraryDto } from './dto/create-ride.dto'
import { RedisService } from 'src/redis/redis.service'
import { ItineraryData } from 'interfaces/itinerary'
import { calculateEstimatedPrices } from 'utils/price.util'
import { parseDuration } from 'utils/time.util'

@Injectable()
export class CreateItineraryService implements OnModuleInit {
   private API_KEY = ''

   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService,
   ) {}

   onModuleInit() {
      this.API_KEY = this.configService.get<string>('GOOGLE_MAP_API_KEY')
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
         const prices = calculateEstimatedPrices(
            route.distanceMeters,
            parseDuration(route.duration) / 60,
         )

         const { duration, polyline, ...routeRest } = route

         this.redisService.set(
            `itinerary:${clientId}`,
            JSON.stringify({
               ...routeRest,
               encodedPolyline: polyline.encodedPolyline,
               prices: prices,
               estimatedDuration: parseDuration(duration),
            }),
            120,
         )
         return {
            prices: prices,
            ...routeRest,
            encodedPolyline: polyline.encodedPolyline,
            estimatedDuration: parseDuration(duration),
            pickUpLocation: createItineraryDto.pickUpLocation,
            dropOffLocation: createItineraryDto.dropOffLocation,
         }
      } catch (error) {
         throw error
      }
   }
}
