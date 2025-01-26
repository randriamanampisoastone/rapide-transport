import { VehicleType } from 'enums/vehicle.enum'
import { LatLng } from './location.interface'

export interface DriverLocationRedis {
   driverProfileId: string
   driverLocation: LatLng
   distance: number
   vehicleType: VehicleType
}
