import { Message } from '@aws-sdk/client-sqs'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SqsMessageHandler } from '@ssut/nestjs-sqs'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { RideData, RideDataKey } from './Model/ride.model'
import { RedisService } from 'src/redis/redis.service'
import { Gateway } from 'src/gateway/gateway'

const RIDE_QUEUE_NAME = 'RapideRideQueue'

@Injectable()
export class FindDriverService implements OnModuleInit {
   private RADIUS_FINDING_DRIVER = 1

   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly redisService: RedisService,
      private readonly gateway: Gateway,
   ) {}

   onModuleInit() {
      this.RADIUS_FINDING_DRIVER =
         this.configService.get<number>('RADIUS_FINDING_DRIVER') || 1
   }

   @SqsMessageHandler(RIDE_QUEUE_NAME, false)
   async handleFindDriver(message: Message) {
      try {
         if (!message.Body) {
            console.error('Message body is empty')
            return
         }

         const data = this.parseMessage(message.Body)
         if (!data || !data.rideId) {
            console.error('Invalid message body:', message.Body)
            return
         }

         const ride = await this.getRideData(data.rideId)
         if (!ride) {
            console.warn(`Ride with ID ${data.rideId} not found in database`)
            return
         }

         const nearbyDrivers = await this.getNearbyDrivers(
            ride.pickUpLocation.longitude,
            ride.pickUpLocation.latitude,
         )
         console.log(
            `Found ${nearbyDrivers.length} drivers within ${this.RADIUS_FINDING_DRIVER} km`,
         )

         if (nearbyDrivers.length === 0) {
            console.warn(
               `No drivers found within ${this.RADIUS_FINDING_DRIVER} km`,
            )
            return
         }

         this.notifyDrivers(nearbyDrivers, {
            rideId: data.rideId,
            ...ride,
            receiptHandle: message.ReceiptHandle,
         })

         // await this.deleteMessageFromQueue(message.ReceiptHandle)
      } catch (error) {
         console.error(
            'Error handling SQS message:',
            error.message,
            error.stack,
         )
      }
   }

   private parseMessage(body: string): any {
      try {
         return JSON.parse(body)
      } catch (error) {
         console.error('Failed to parse SQS message body:', body, error.message)
         return null
      }
   }

   private async getRideData(rideId: string) {
      try {
         return await this.rideModel.get({ rideId })
      } catch (error) {
         console.error(
            `Error fetching ride data for ID ${rideId}:`,
            error.message,
         )
         return null
      }
   }

   private async getNearbyDrivers(
      longitude: number,
      latitude: number,
   ): Promise<string[]> {
      try {
         return await this.redisService.getNearbyMembers(
            'DriverGroup',
            longitude,
            latitude,
            this.RADIUS_FINDING_DRIVER,
            'km',
         )
      } catch (error) {
         console.error('Error fetching nearby drivers:', error.message)
         return []
      }
   }

   private notifyDrivers(
      drivers: string[],
      ride: RideData & { rideId: string },
   ): void {
      drivers.forEach((driver) => {
         this.gateway.sendNotificationToDriver(driver, ride)
      })
   }
}
