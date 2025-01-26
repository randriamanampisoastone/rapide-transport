import {
   Injectable,
   InternalServerErrorException,
   HttpException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { CreateItineraryService } from './create-itinerary.service'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { DynamoDBError } from 'errors/dynamodb.error'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { VehicleType } from 'enums/vehicle.enum'
import { ItineraryData } from 'interfaces/itinerary.interface'
import { EstimatedPrice } from 'interfaces/price.interface'
import { ITINERARY_PREFIX, RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { PaymentMethodType } from 'enums/payment.enum'
import { LatLng } from 'interfaces/location.interface'
import { FindDriverService } from './find-driver.service'

export interface CreateRideDto {
   clientProfileId: string
   pickUpLocation: LatLng
   dropOffLocation: LatLng
   vehicleType: VehicleType
   paymentMethodType: PaymentMethodType
}

@Injectable()
export class CreateRideService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,
      private readonly createItineraryService: CreateItineraryService,
      private readonly redisService: RedisService,
      private readonly FindDriverService: FindDriverService,
   ) {}

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

   async sendRideDataBase(data: RideData) {
      try {
         return await this.rideModel.create(data)
      } catch (error) {
         throw DynamoDBError(error)
      }
   }

   async createRide(createRideDto: CreateRideDto) {
      try {
         const clientProfileId = createRideDto.clientProfileId
         const pickUpLocation = createRideDto.pickUpLocation
         const dropOffLocation = createRideDto.dropOffLocation
         const vehicleType = createRideDto.vehicleType
         const paymentMethodType = createRideDto.paymentMethodType

         const itinerary = await this.redisService.get(
            `${ITINERARY_PREFIX + clientProfileId}`,
         )

         let estimatedPrice: EstimatedPrice
         let rideData: RideData

         if (itinerary) {
            const itineraryData = JSON.parse(itinerary)
            const { encodedPolyline, distanceMeters, estimatedDuration } =
               itineraryData

            estimatedPrice = this.getPrice(vehicleType, itineraryData, null)

            rideData = {
               rideId: crypto.randomUUID(),
               clientProfileId,
               vehicleType,
               paymentMethodType,
               pickUpLocation,
               dropOffLocation,
               encodedPolyline,
               distanceMeters,
               estimatedDuration,
               estimatedPrice,
               status: RideStatus.FINDING_DRIVER,
            }
         } else {
            const {
               pickUpLocation,
               dropOffLocation,
               vehicleType,
               paymentMethodType,
            } = createRideDto

            const newItinerary =
               await this.createItineraryService.createItinerary({
                  clientProfileId,
                  pickUpLocation,
                  dropOffLocation,
               })

            const { encodedPolyline, distanceMeters, estimatedDuration } =
               newItinerary

            estimatedPrice = this.getPrice(vehicleType, null, newItinerary)

            rideData = {
               rideId: crypto.randomUUID(),
               clientProfileId,
               vehicleType,
               paymentMethodType,
               pickUpLocation,
               dropOffLocation,
               encodedPolyline,
               distanceMeters,
               estimatedDuration,
               estimatedPrice,
               status: RideStatus.FINDING_DRIVER,
            }
         }

         await this.FindDriverService.notifyDrivers(rideData)

         await this.redisService.set(
            `${RIDE_PREFIX + rideData.rideId}`,
            JSON.stringify(rideData),
            1800, // 30 minutes
         )

         const result = await this.sendRideDataBase(rideData)
         return result
      } catch (error) {
         console.error('Error creating ride:', error)
         throw new InternalServerErrorException('Error creating ride')
      }
   }
}
