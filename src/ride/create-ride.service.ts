import {
   Injectable,
   OnModuleInit,
   InternalServerErrorException,
   HttpException,
} from '@nestjs/common'
import { CreateRideDto } from './dto/create-ride.dto'
import { RedisService } from 'src/redis/redis.service'
import { CreateItineraryService } from './create-itinerary.service'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { DynamoDBError } from 'errors/dynamodb.error'
import { SqsService } from '@ssut/nestjs-sqs'
import { ConfigService } from '@nestjs/config'
import { RideData, RideDataKey } from 'interfaces/ride'
import { VehicleType } from 'enums/vehicle'
import { ItineraryData } from 'interfaces/itinerary'
import { EstimatedPrice } from 'interfaces/price'

@Injectable()
export class CreateRideService implements OnModuleInit {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly createItineraryService: CreateItineraryService,
      private readonly redisService: RedisService,
      private readonly sqsService: SqsService,
      private readonly configService: ConfigService,
   ) {}
   private RIDE_QUEUE_NAME = ''
   onModuleInit() {
      this.RIDE_QUEUE_NAME = this.configService.get<string>('RIDE_QUEUE_NAME')
   }

   private getPrice(
      vehicleType: VehicleType,
      itineraryData: ItineraryData,
      newItinerary: ItineraryData,
   ): EstimatedPrice {
      switch (vehicleType) {
         case VehicleType.MOTO:
            return itineraryData
               ? itineraryData.prices.moto
               : newItinerary.prices.moto
         case VehicleType.LITE_CAR:
            return itineraryData
               ? itineraryData.prices.liteCar
               : newItinerary.prices.liteCar
         case VehicleType.PREMIUM_CAR:
            return itineraryData
               ? itineraryData.prices.premiumCar
               : newItinerary.prices.premiumCar
         default:
            throw new HttpException('Invalid vehicle type', 400)
      }
   }

   async sendMessageToQueue(rideId: string, timestamp: string) {
      const messageBody = {
         rideId,
         timestamp,
      }

      try {
         await this.sqsService.send(this.RIDE_QUEUE_NAME, {
            id: rideId,
            body: messageBody,
         })
      } catch (error) {
         console.error('Error sending message to SQS:', error)
      }
   }

   async sendRideDataBase(data: RideData) {
      try {
         return await this.rideModel.create(data)
      } catch (error) {
         throw DynamoDBError(error)
      }
   }

   async createRide(createRideDto: CreateRideDto, clientId: string) {
      try {
         const itinerary = await this.redisService.get(`itinerary:${clientId}`)

         let estimatedPrice: EstimatedPrice
         let rideData: RideData

         if (itinerary) {
            const itineraryData = JSON.parse(itinerary)

            estimatedPrice = this.getPrice(
               createRideDto.vehicleType,
               itineraryData,
               null,
            )
            rideData = {
               rideId: crypto.randomUUID(),
               clientId: clientId,
               vehicleType: createRideDto.vehicleType,
               estimatedPrice,
               distanceMeters: itineraryData.distanceMeters,
               encodedPolyline: itineraryData.encodedPolyline,
               pickUpLocation: createRideDto.pickUpLocation,
               dropOffLocation: createRideDto.dropOffLocation,
               estimatedDuration: itineraryData.estimatedDuration,
            }
         } else {
            const { vehicleType, ...createItineraryDto } = createRideDto
            const newItinerary =
               await this.createItineraryService.createItinerary(
                  createItineraryDto,
                  clientId,
               )

            // Get price based on vehicle type
            estimatedPrice = this.getPrice(
               createRideDto.vehicleType,
               null,
               newItinerary,
            )

            rideData = {
               rideId: crypto.randomUUID(),
               clientId: clientId,
               vehicleType: createRideDto.vehicleType,
               estimatedPrice,
               distanceMeters: newItinerary.distanceMeters,
               encodedPolyline: newItinerary.encodedPolyline,
               pickUpLocation: createRideDto.pickUpLocation,
               dropOffLocation: createRideDto.dropOffLocation,
               estimatedDuration: newItinerary.estimatedDuration,
            }
         }

         // inject into redis
         this.redisService.set(
            rideData.rideId,
            JSON.stringify({ startTime: Date.now(), ...rideData }),
            rideData.estimatedDuration + 3600 * 2,
         )
         const result = await this.sendRideDataBase(rideData)
         await this.sendMessageToQueue(result.rideId, result.createdAt)
         return result
      } catch (error) {
         console.error('Error creating ride:', error)
         throw new InternalServerErrorException('Error creating ride')
      }
   }

   async findRide(rideId: string) {
      try {
         return await this.rideModel.get({ rideId })
      } catch (error) {
         throw DynamoDBError(error)
      }
   }
}
