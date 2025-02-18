import {
   Injectable,
   InternalServerErrorException,
   HttpException,
   ForbiddenException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { CreateItineraryService } from './create-itinerary.service'
import { RideData } from 'interfaces/ride.interface'
import { VehicleType } from 'enums/vehicle.enum'
import { ItineraryData } from 'interfaces/itinerary.interface'
import { EstimatedPrice } from 'interfaces/price.interface'
import { ITINERARY_PREFIX, RIDE_PREFIX } from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { PaymentMethodType } from 'enums/payment.enum'
import { LatLng } from 'interfaces/location.interface'
import { FindDriverService } from './find-driver.service'
import { PrismaService } from 'src/prisma/prisma.service'
import {
   parseRideDataForPostgres,
   parseRidePostgresDataForRideData,
} from 'utils/rideDataParser.util'
import { ProfileStatus } from '@prisma/client'

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
            throw new HttpException('Invalid vehicle type', 400)
      }
   }

   async sendRideDataBase(data: RideData) {
      try {
         const createdRide = await this.prismaService.ride.create({
            data: {
               ...parseRideDataForPostgres(data),
            },
         })

         return parseRidePostgresDataForRideData(createdRide)
      } catch (error) {
         throw error
      }
   }

   async createRide(createRideDto: CreateRideDto) {
      try {
         const user = await this.prismaService.clientProfile.findUnique({
            where: {
               clientProfileId: createRideDto.clientProfileId,
            },
            select: {
               status: true,
            },
         })

         if (user.status !== ProfileStatus.ACTIVE) {
            throw new ForbiddenException('The user is not active')
         }

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
               ].includes(ride_already_exist.status)
            ) {
               return ride_already_exist
            }
         }

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
            await this.redisService.remove(
               `${ITINERARY_PREFIX + clientProfileId}`,
            )
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
