import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride'
import { LocationService } from 'src/location/location.service'

@Injectable()
export class FindDriverService implements OnModuleInit, OnModuleDestroy {
   private intervalId: NodeJS.Timeout

   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
      private readonly locationService: LocationService
   ) {}

   onModuleInit() {
      const intervalInSeconds =
         this.configService.get<number>('SCAN_INTERVAL') || 5

      this.intervalId = setInterval(async () => {
         await this.scanAndNotifyDrivers()
      }, intervalInSeconds * 1000)
   }

   onModuleDestroy() {
      if (this.intervalId) {
         clearInterval(this.intervalId)
      }
   }

   private async scanAndNotifyDrivers() {
      try {
         console.log('Scanning for available rides...')
         const rides = await this.rideModel
            .scan('status')
            .eq(RideStatus.FINDING_DRIVER)
            .exec()

         rides.forEach((ride) => {
            this.notifyDrivers(ride)
         })
      } catch (error) {
         console.error('Error scanning and notifying drivers:', error.message)
      }
   }

   private async notifyDrivers(ride: RideData & { rideId: string }): Promise<void> {
      const drivers = await this.locationService.getDriversNearby(ride.pickUpLocation)
      drivers.forEach((driver) => {
         this.gateway.sendNotificationToDriver(ride, driver.driverId)
      })
   }
}
