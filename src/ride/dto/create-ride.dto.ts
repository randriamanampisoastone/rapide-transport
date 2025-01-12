import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator'
import { VehicleType } from 'enums/vehicle'

export class Location {
   @IsLatitude()
   latitude: number

   @IsLongitude()
   longitude: number
}

export class CreateItineraryDto {
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
