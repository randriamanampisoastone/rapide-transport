import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RedisService } from 'src/redis/redis.service'
import { InfoOnRideService } from './info-on-ride.service'
import {
   EVENT_CLIENT_WAITING,
   EVENT_DRIVER_AVAILABLE,
   EVENT_INFO_ON_RIDE,
} from 'constants/event.constant'

@Injectable()
export class FindDriverService implements OnModuleInit, OnModuleDestroy {
   private intervalId: NodeJS.Timeout

   constructor(
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly infoOnRideService: InfoOnRideService,
   ) {}

   onModuleInit() {
      const intervalInSeconds = this.configService.get<number>('SCAN_INTERVAL')
      if (!intervalInSeconds || intervalInSeconds <= 0) {
         throw new Error('Invalid SCAN_INTERVAL configuration')
      }

      this.intervalId = setInterval(() => {
         this.scanAndNotifyDrivers()
         this.calculeAndShearRideInfo()
      }, intervalInSeconds * 1000)
   }

   onModuleDestroy() {
      if (this.intervalId) {
         clearInterval(this.intervalId)
      }
   }

   private async scanAndNotifyDrivers(): Promise<void> {
      try {
         const ridesAvailable = await this.redisService.getRideAvailable()

         if (ridesAvailable.length === 0) {
            console.log('No rides found requiring drivers.')
            return
         }
         console.log(`Found ${ridesAvailable.length} rides requiring drivers.`)

         const clientProfileIds = ridesAvailable.map(
            (ride) => ride.clientProfileId,
         )

         this.gateway.sendNotificationToAdmin(EVENT_CLIENT_WAITING, {
            count: ridesAvailable.length,
            clientProfileIds,
            data: ridesAvailable,
         })

         await Promise.all(
            ridesAvailable.map((ride) => this.notifyDrivers(ride)),
         )
      } catch (error) {
         console.error(
            'Error during scanAndNotifyDrivers:',
            error.message,
            error.stack,
         )
      }
   }

   async notifyDrivers(ride: RideData): Promise<void> {
      try {
         const pickUpLocation = ride.pickUpLocation
         const vehicleType = ride.vehicleType

         const drivers = await this.redisService.getDriversNearby(
            pickUpLocation,
            vehicleType,
         )

         console.log(`Drivers  ${drivers.length} found`)

         this.gateway.sendNotificationToAdmin(EVENT_DRIVER_AVAILABLE, {
            count: drivers.length,
            data: drivers,
         })

         const rideId = ride.rideId

         if (!drivers || drivers.length === 0) {
            console.log(`No drivers available for ride ID: ${rideId}`)
            return
         }

         await Promise.all(
            drivers.map((driver) =>
               this.gateway.sendNotificationToDriver(
                  driver.driverProfileId,
                  'rideAvailable',
                  ride,
               ),
            ),
         )
      } catch (error) {
         console.error(
            `Error notifying drivers for ride ID ${ride.rideId}:`,
            error.message,
         )
      }
   }

   private async calculeAndShearRideInfo() {
      try {
         const rideAvailable = await this.redisService.getRideOnRide()

         if (!rideAvailable.length) {
            console.log('No ride on process')
            return
         }

         console.log(`Found ${rideAvailable.length} rides on process`)

         await Promise.all(
            rideAvailable.map(async (ride) => {
               await this.infoOnRideService.infoOnRide(
                  ride.rideId,
                  ride.clientProfileId,
                  ride.driverProfileId,
                  this.gateway.server,
               )
            }),
         )

         this.gateway.sendNotificationToAdmin(EVENT_INFO_ON_RIDE, rideAvailable)
      } catch (error) {
         throw error
      }
   }
}
