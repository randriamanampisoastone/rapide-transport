import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey, RideStatus } from 'interfaces/ride'

@Injectable()
export class FindDriverService implements OnModuleInit, OnModuleDestroy {
   private intervalId: NodeJS.Timeout

   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
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

   private notifyDrivers(ride: RideData & { rideId: string }): void {
      this.gateway.sendNotificationToDriver(ride)
   }
}
