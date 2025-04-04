import { VehicleType } from 'enums/vehicle.enum'
import { EstimatedPrice } from './price.interface'
import { LatLng } from './location.interface'
import { MethodType } from 'enums/payment.enum'
import { RideStatus } from 'enums/ride.enum'

export interface RideDataKey {
   rideId: string
   clientProfileId?: string
   driverProfileId?: string
}

export interface RideData {
   rideId: string

   clientProfileId: string
   driverProfileId?: string

   vehicleType: VehicleType
   plateNumber?: string

   methodType: MethodType

   pickUpLocation: LatLng
   dropOffLocation: LatLng
   encodedPolyline: string
   distanceMeters: number

   estimatedDuration: number
   estimatedPrice: EstimatedPrice

   realDuration?: number
   realPrice?: number

   status?: RideStatus

   note?: number
   review?: string

   startTime?: number
   endTime?: number

   createdAt?: string
   updateAt?: string
}
