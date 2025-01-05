import { Injectable } from '@nestjs/common'
import { RideData, RideDataKey, RideStatus } from './Model/ride.model'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { ConfigService } from '@nestjs/config'
import { Gateway } from 'src/gateway/gateway'

export interface AcceptDriverDto {
   driverId: string
   rideId: string
   receiptHandle: string
   clientId: string
}

@Injectable()
export class AcceptRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly configService: ConfigService,
      private readonly gateway: Gateway,
   ) {}

   async acceptDriver(acceptDriverDto: AcceptDriverDto): Promise<void> {
      // Récupération des données de la course
      const resultRide = await this.rideModel.get({
         rideId: acceptDriverDto.rideId,
      })

      // Vérification si la course existe et si son statut est "PENDING"
      if (!resultRide) {
         throw new Error('Ride not found')
      }
      if (resultRide.status === RideStatus.PENDING) {
         // Mise à jour du statut de la course et attribution du conducteur
         await this.rideModel.update(
            {
               rideId: acceptDriverDto.rideId,
            },
            {
               driverId: acceptDriverDto.driverId,
               status: RideStatus.DRIVER_ACCEPTED, // Statut mis à jour
            },
         )
         this.deleteMessageFromQueue(acceptDriverDto.receiptHandle)
         this.gateway.sendNotificationToClient(
            acceptDriverDto.clientId,
            acceptDriverDto.driverId,
         )
      } else {
         throw new Error('Ride is not in PENDING status')
      }
   }

   private async deleteMessageFromQueue(receiptHandle: string): Promise<void> {
      try {
         const sqsClient = new SQSClient({
            region: this.configService.get<string>('AWS_REGION'),
         })
         const deleteCommand = new DeleteMessageCommand({
            QueueUrl: this.configService.get<string>('RIDE_QUEUE_URL'),
            ReceiptHandle: receiptHandle,
         })
         await sqsClient.send(deleteCommand)
         console.log('Message deleted from SQS.')
      } catch (error) {
         console.error('Failed to delete message from SQS:', error.message)
      }
   }
}
