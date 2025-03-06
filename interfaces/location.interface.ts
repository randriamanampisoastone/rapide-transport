import { VehicleType } from 'enums/vehicle.enum'

export interface LatLng {
   latitude: number
   longitude: number
}

export interface LocationData {
   userId: string
   userGroup: string
   location: LatLng
}

export interface UpdateClientLocationInterface {
   clientProfileId: string
   clientLocation: LatLng
   driverProfileId?: string
}

export interface UpdateDriverLocationInterface {
   driverProfileId: string
   driverLocation: LatLng
   vehicleType: VehicleType
   isOnRide: boolean
   clientProfileId?: string
}
