/* eslint-disable @typescript-eslint/no-unused-vars */
import {
   Injectable,
   InternalServerErrorException,
   HttpException,
   BadRequestException,
   Logger,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { CreateItineraryService } from './create-itinerary.service'
import { RideData } from 'interfaces/ride.interface'
import { VehicleType } from 'enums/vehicle.enum'
import { ItineraryData } from 'interfaces/itinerary.interface'
import { EstimatedPrice } from 'interfaces/price.interface'
import { ITINERARY_PREFIX, RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { MethodType } from 'enums/payment.enum'
import { LatLng } from 'interfaces/location.interface'
import { FindDriverService } from './find-driver.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { stringifyRideData, parseRideData } from 'utils/rideDataParser.util'
import {
   ERROR_INTERNAL_SERVER_ERROR,
   ERROR_INVALID_VEHICLE,
   ERROR_REDIS_SET_FAILED,
} from 'constants/error.constant'

export interface CreateRideDto {
   clientProfileId: string
   pickUpLocation: LatLng
   dropOffLocation: LatLng
   vehicleType: VehicleType
   methodType: MethodType
}

@Injectable()
export class CreateRideService {
   private readonly logger = new Logger(CreateRideService.name)

   constructor(
      private readonly createItineraryService: CreateItineraryService,
      private readonly redisService: RedisService,
      private readonly FindDriverService: FindDriverService,
      private readonly prismaService: PrismaService,
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
            throw new BadRequestException(ERROR_INVALID_VEHICLE)
      }
   }

   async sendRideDataBase(data: RideData) {
      try {
         const createdRide = await this.prismaService.ride.create({
            data: {
               ...stringifyRideData(data),
            },
         })

         return parseRideData(createdRide)
      } catch (error) {
         console.log(error)

         throw new InternalServerErrorException(
            'Error occurred on sending data',
         )
      }
   }

   async createRide(createRideDto: CreateRideDto) {
      try {
         const rideKeys = await this.redisService.keys(`${RIDE_PREFIX}*`)
         const rideDataList = rideKeys.length
            ? await this.redisService.mget(rideKeys)
            : []
         const rideDatas: RideData[] = rideDataList.map((ride) =>
            JSON.parse(ride),
         )

         const ride_already_exist: RideData = rideDatas.filter(
            (data) => data.clientProfileId === createRideDto.clientProfileId,
         )[0]

         if (ride_already_exist !== undefined) {
            if (
               ![
                  RideStatus.COMPLETED,
                  RideStatus.STOPPED,
                  RideStatus.CLIENT_GIVE_UP,
                  RideStatus.CANCELLED,
                  RideStatus.ADMIN_CANCELLED,
               ].includes(ride_already_exist.status)
            ) {
               return ride_already_exist
            }
         }

         const clientProfileId = createRideDto.clientProfileId
         const pickUpLocation = createRideDto.pickUpLocation
         const dropOffLocation = createRideDto.dropOffLocation
         const vehicleType = createRideDto.vehicleType
         const methodType = createRideDto.methodType

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
               methodType,
               pickUpLocation,
               dropOffLocation,
               encodedPolyline,
               distanceMeters,
               estimatedDuration,
               estimatedPrice,
               status: RideStatus.FINDING_DRIVER,
               createdAt: new Date().toISOString(),
            }
            await this.redisService.remove(
               `${ITINERARY_PREFIX + clientProfileId}`,
            )
         } else {
            const { pickUpLocation, dropOffLocation, vehicleType, methodType } =
               createRideDto

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
               methodType,
               pickUpLocation,
               dropOffLocation,
               encodedPolyline,
               distanceMeters,
               estimatedDuration,
               estimatedPrice,
               status: RideStatus.FINDING_DRIVER,
               createdAt: new Date().toISOString(),
            }
         }

         await this.FindDriverService.notifyDrivers(rideData)

         try {
            await this.redisService.set(
               `${RIDE_PREFIX + rideData.rideId}`,
               JSON.stringify(rideData),
               900,
            )
         } catch (error) {
            this.logger.error(
               `Redis SET failed for ride: ${error.message}`,
               error.stack,
            )
            throw new InternalServerErrorException(ERROR_REDIS_SET_FAILED)
         }

         const result = await this.sendRideDataBase(rideData)

         return result
      } catch (error) {
         throw new InternalServerErrorException(ERROR_INTERNAL_SERVER_ERROR)
      }
   }
}
