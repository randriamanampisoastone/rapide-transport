import { LatLng } from './location.interface'

export interface DriverLocationRedis {
   driverProfileId: string
   latLng: LatLng
   distance: number
}
