import { Injectable } from '@nestjs/common'
import { getRouteGoogleMap } from 'api/route.googlemap.api'
import { RedisService } from 'src/redis/redis.service'
import { ItineraryData } from 'interfaces/itinerary.interface'
import { calculateEstimatedPrices } from 'utils/price.util'
import { parseDuration } from 'utils/time.util'
import { ITINERARY_PREFIX } from 'constants/redis.constant'
import { LatLng } from 'interfaces/location.interface'

export interface CreateItineraryDto {
   clientProfileId: string
   pickUpLocation: LatLng
   dropOffLocation: LatLng
}

@Injectable()
export class CreateItineraryService {
   constructor(private readonly redisService: RedisService) {}

   async createItinerary(
      createItineraryDto: CreateItineraryDto,
   ): Promise<ItineraryData> {
      try {
         const clientProfileId = createItineraryDto.clientProfileId
         const pickUpLocation = createItineraryDto.pickUpLocation
         const dropOffLocation = createItineraryDto.dropOffLocation

         const route = await getRouteGoogleMap(pickUpLocation, dropOffLocation)

         const { duration, polyline, distanceMeters } = route
         const estimatedDuration = parseDuration(duration)
         const encodedPolyline = polyline.encodedPolyline

         const prices = calculateEstimatedPrices(
            distanceMeters,
            estimatedDuration,
         )

         const itineraryData: ItineraryData = {
            pickUpLocation,
            dropOffLocation,
            encodedPolyline,
            distanceMeters,
            estimatedDuration,
            prices,
         }

         await this.redisService.set(
            `${ITINERARY_PREFIX + clientProfileId}`,
            JSON.stringify(itineraryData),
            900, // 15 minutes
         )

         return itineraryData
      } catch (error) {
         throw error
      }
   }
}
