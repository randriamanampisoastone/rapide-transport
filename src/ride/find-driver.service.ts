import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride.interface'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class FindDriverService implements OnModuleInit, OnModuleDestroy {
   private intervalId: NodeJS.Timeout

   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
   ) {}

   onModuleInit() {
      const intervalInSeconds = this.configService.get<number>('SCAN_INTERVAL')
      if (!intervalInSeconds || intervalInSeconds <= 0) {
         throw new Error('Invalid SCAN_INTERVAL configuration')
      }

      this.intervalId = setInterval(
         () => this.scanAndNotifyDrivers(),
         intervalInSeconds * 1000,
      )
   }

   onModuleDestroy() {
      if (this.intervalId) {
         clearInterval(this.intervalId)
      }
   }

   private async scanAndNotifyDrivers(): Promise<void> {
      try {
         const rides = await this.rideModel
            .scan('status')
            .eq(RideStatus.FINDING_DRIVER)
            .exec()

         if (rides.length === 0) {
            console.log('No rides found requiring drivers.')
            return
         }
         console.log(`Found ${rides.length} rides requiring drivers.`)

         await Promise.all(rides.map((ride) => this.notifyDrivers(ride)))
      } catch (error) {
         console.error(
            'Error during scanAndNotifyDrivers:',
            error.message,
            error.stack,
         )
      }
   }

   private async notifyDrivers(
      ride: RideData & { rideId: string },
   ): Promise<void> {
      try {
         const drivers = await this.redisService.getDriversNearby(
            ride.pickUpLocation,
         )
         console.log(`Drivers  ${drivers.length} found`)

         if (!drivers || drivers.length === 0) {
            console.log(`No drivers available for ride ID: ${ride.rideId}`)
            return
         }

         await Promise.all(
            drivers.map((driver) =>
               this.gateway.sendNotificationToDriver(
                  ride,
                  driver.driverProfileId,
               ),
            ),
         )

         // console.log(`Notifications sent for ride ID: ${ride.rideId}`)
      } catch (error) {
         console.error(
            `Error notifying drivers for ride ID ${ride.rideId}:`,
            error.message,
         )
      }
   }
}
