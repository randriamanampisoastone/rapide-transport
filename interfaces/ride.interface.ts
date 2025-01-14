import { VehicleType } from 'enums/vehicle.enum'
import { EstimatedPrice } from './price.interface'
import { LatLng } from './location.interface'

export enum RideStatus {
   FINDING_DRIVER = 'FINDING_DRIVER',
   DRIVER_ACCEPTED = 'DRIVER_ACCEPTED',
   DRIVER_ON_THE_WAY = 'DRIVER_ON_THE_WAY',
   DRIVER_ARRIVED = 'DRIVER_ARRIVED',
   CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
   ON_RIDE = 'ON_RIDE',
   CLIENT_GIVE_UP = 'CLIENT_GIVE_UP',
   COMPLETED = 'COMPLETED',
   CANCELLED = 'CANCELLED',
}

export interface RideDataKey {
   rideId: string
}

export interface RideData {
   rideId: string
   clientProfileId: string
   vehicleType: VehicleType
   distanceMeters: number
   encodedPolyline: string
   pickUpLocation: LatLng
   dropOffLocation: LatLng
   estimatedDuration: number
   realDuration?: number
   driverProfileId?: string
   vehicleId?: string
   realPrice?: number
   estimatedPrice: EstimatedPrice
   status?: RideStatus
   startTimes?: number
   endTimes?: number
   createdAt?: string
   updateAt?: string
}
