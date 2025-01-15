import { Injectable } from '@nestjs/common'
import { getRouteGoogleMap } from 'api/route.googlemap.api'

import { CreateItineraryDto } from './dto/create-ride.dto'
import { RedisService } from 'src/redis/redis.service'
import { ItineraryData } from 'interfaces/itinerary.interface'
import { calculateEstimatedPrices } from 'utils/price.util'
import { parseDuration } from 'utils/time.util'
import { ITINERARY_PREFIX } from 'constants/redis.constant'

@Injectable()
export class CreateItineraryService {
   constructor(private readonly redisService: RedisService) {}

   async createItinerary(
      createItineraryDto: CreateItineraryDto,
      clientProfileId: string,
   ): Promise<ItineraryData> {
      try {
         const route = await getRouteGoogleMap(
            createItineraryDto.pickUpLocation,
            createItineraryDto.dropOffLocation,
         )
         const prices = calculateEstimatedPrices(
            route.distanceMeters,
            parseDuration(route.duration) / 60,
         )

         const { duration, polyline, ...routeRest } = route

         this.redisService.set(
            `${ITINERARY_PREFIX + clientProfileId}`,
            JSON.stringify({
               ...routeRest,
               encodedPolyline: polyline.encodedPolyline,
               prices: prices,
               estimatedDuration: parseDuration(duration),
            }),
            120,
         )
         console.log('route', {
            prices: prices,
            ...routeRest,
            encodedPolyline: polyline.encodedPolyline,
            estimatedDuration: parseDuration(duration),
            pickUpLocation: createItineraryDto.pickUpLocation,
            dropOffLocation: createItineraryDto.dropOffLocation,
         })

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
