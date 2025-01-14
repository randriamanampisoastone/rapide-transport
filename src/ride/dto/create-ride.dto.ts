import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator'
import { VehicleType } from 'enums/vehicle.enum'

class LatLng {
   @IsLatitude()
   latitude: number

   @IsLongitude()
   longitude: number
}

export class CreateItineraryDto {
   @IsNotEmpty()
   pickUpLocation: LatLng

   @IsNotEmpty()
   dropOffLocation: LatLng
}

export class CreateRideDto {
   @IsNotEmpty()
   pickUpLocation: LatLng

   @IsNotEmpty()
   dropOffLocation: LatLng

   @IsNotEmpty()
   vehicleType: VehicleType
}
