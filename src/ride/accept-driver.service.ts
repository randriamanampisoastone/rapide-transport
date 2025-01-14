import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { ConfigService } from '@nestjs/config'
import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride.interface'
import { getRouteGoogleMap } from 'api/route.googlemap.api'
import { LatLng } from 'interfaces/location.interface'

export interface AcceptDriverDto {
   driverProfileId: string
   rideId: string
   latLng: LatLng
}

@Injectable()
export class AcceptRideService implements OnModuleInit {
   private GOOGLE_MAP_API_KEY = ''
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
   ) {}
   onModuleInit() {
      this.GOOGLE_MAP_API_KEY =
         this.configService.get<string>('GOOGLE_MAP_API_KEY')

      if (!this.GOOGLE_MAP_API_KEY) {
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
               driverProfileId: acceptDriverDto.driverProfileId,
               status: RideStatus.DRIVER_ACCEPTED,
            },
         )

         const routeDriverToClient = await getRouteGoogleMap(
            acceptDriverDto.latLng,
            resultRide.pickUpLocation,
         )
         this.gateway.sendNotificationToClient(
            resultRide.clientProfileId,
            acceptDriverDto.driverProfileId,
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
