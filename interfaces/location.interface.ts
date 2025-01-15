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
export interface UpdateLocationInterface {
   latLng: LatLng
   clientProfileId?: string
   driverProfileId?: string
   vehicleType?: VehicleType
   isAvailable: boolean
}
