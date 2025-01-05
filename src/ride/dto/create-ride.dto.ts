import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from 'class-validator'
import { VehicleType } from '../Model/ride.model'

export class Location {
   @IsLatitude()
   latitude: number

   @IsLongitude()
   longitude: number
}

export class CreateItineraryDto {
   @IsString()
   @IsNotEmpty()
   clientId: string

   @IsNotEmpty()
   pickUpLocation: Location

   @IsNotEmpty()
   dropOffLocation: Location
}

export class CreateRideDto {
   @IsNotEmpty()
   pickUpLocation: Location

   @IsNotEmpty()
   dropOffLocation: Location

   @IsNotEmpty()
   vehicleType: VehicleType
}
