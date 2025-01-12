import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { ConfigService } from '@nestjs/config'
import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride'
import { getRouteGoogleMap } from 'api/route.googlemap'
import { LatLng } from 'interfaces/itinerary'

export interface AcceptDriverDto {
   driverId: string
   rideId: string
   latLng: LatLng
}

@Injectable()
export class AcceptRideService implements OnModuleInit {
   private API_KEY = ''
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
   ) {}
   onModuleInit() {
      this.API_KEY = this.configService.get<string>('GOOGLE_MAP_API_KEY')

      if (!this.API_KEY) {
         throw new Error('Google Maps API Key is missing!')
      }
   }
   async acceptDriver(acceptDriverDto: AcceptDriverDto) {
      const resultRide = await this.rideModel.get({
         rideId: acceptDriverDto.rideId,
      })

      if (!resultRide) {
         throw new Error('Ride not found')
      }
      if (resultRide.status === RideStatus.FINDING_DRIVER) {
         await this.rideModel.update(
            {
               rideId: acceptDriverDto.rideId,
            },
            {
               driverId: acceptDriverDto.driverId,
               status: RideStatus.DRIVER_ACCEPTED,
            },
         )

         const routeDriverToClient = await getRouteGoogleMap(
            acceptDriverDto.latLng,
            resultRide.pickUpLocation,
            this.API_KEY,
         )
         this.gateway.sendNotificationToClient(
            resultRide.clientId,
            acceptDriverDto.driverId,
            this.parseDuration(routeDriverToClient.duration),
            routeDriverToClient.polyline.encodedPolyline,
         )

         return {
            encodedPolyline: routeDriverToClient.polyline.encodedPolyline,
            distanceMeters: routeDriverToClient.distanceMeters,
            estimatedDuration: this.parseDuration(routeDriverToClient.duration),
         }
      } else {
         throw new Error('Ride is not in FINDING_DRIVER status')
      }
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
}
