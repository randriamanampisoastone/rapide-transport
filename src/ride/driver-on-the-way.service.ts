import {
   BadRequestException,
   ForbiddenException,
   HttpException,
   Injectable,
   NotFoundException,
   OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { LatLng } from 'interfaces/location.interface'
import { getRouteGoogleMap } from 'api/route.googlemap.api'
import { parseDuration } from 'utils/time.util'
import { PrismaService } from 'src/prisma/prisma.service'
import {
   EVENT_DRIVER_ON_THE_WAY,
   EVENT_DRIVER_ON_THE_WAY_POLYLINE,
} from 'constants/event.constant'
import { UserRole } from 'enums/profile.enum'

export interface DriverOnTheWayDto {
   driverProfileId: string
   rideId: string
   driverLocation: LatLng
}

@Injectable()
export class DriverOnTheWayService implements OnModuleInit {
   private GOOGLE_MAP_API_KEY = ''
   constructor(
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}
   onModuleInit() {
      this.GOOGLE_MAP_API_KEY =
         this.configService.get<string>('GOOGLE_MAP_API_KEY')
      if (!this.GOOGLE_MAP_API_KEY) {
         throw new Error('Google Maps API Key is missing!')
      }
   }
   async driverOnTheWay(driverOnTheWayDto: DriverOnTheWayDto) {
      try {
         const rideId = driverOnTheWayDto.rideId
         const driverProfileId = driverOnTheWayDto.driverProfileId
         const driverLocation = driverOnTheWayDto.driverLocation

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.DRIVER_ACCEPTED) {
            // throw new Error('Ride is not in DRIVER_ACCEPTED status')
            throw new BadRequestException(
               'Ride is not in DRIVER_ACCEPTED status',
            )
         }
         if (rideData.driverProfileId !== driverProfileId) {
            // throw new Error('Driver is not the driver of the ride')
            throw new ForbiddenException('Driver is not the driver of the ride')
         }

         const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,
            ...rideDataRest
         } = rideData

         const startTime = Date.now()
         const rideDataUpdated = {
            startTime,
            status: RideStatus.DRIVER_ON_THE_WAY,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         const pickUpLocation = rideDataUpdated.pickUpLocation

         const routeDriverToClient = await getRouteGoogleMap(
            driverLocation,
            pickUpLocation,
         )
         const clientProfileId = rideDataUpdated.clientProfileId
         const encodedPolyline: string =
            routeDriverToClient.polyline.encodedPolyline
         const estimatedDuration: number = parseDuration(
            routeDriverToClient.duration,
         )

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            estimatedDuration + 7200, // Estimated Duration + 2 heures
         )

         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               startTime,
               driverProfileId,
               status: RideStatus.DRIVER_ON_THE_WAY,
            },
         })

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_DRIVER_ON_THE_WAY,
            {
               encodedPolyline,
               estimatedDuration,
            },
         )

         this.gateway.sendNotificationToAdmin(
            [UserRole.RIDER, UserRole.CALL_CENTER, UserRole.MANAGER_HUB],
            EVENT_DRIVER_ON_THE_WAY,
            {
               ...rideDataUpdated,
            },
         )

         this.gateway.sendNotificationToAdmin(
            [UserRole.RIDER, UserRole.CALL_CENTER, UserRole.MANAGER_HUB],
            EVENT_DRIVER_ON_THE_WAY_POLYLINE,
            {
               encodedPolyline,
               estimatedDuration,
               driverProfileId,
            },
         )
         return {
            encodedPolyline,
            estimatedDuration,
         }
      } catch (error) {
         // throw error
         throw new HttpException(error.message, error.status)
      }
   }
}
