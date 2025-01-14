import { LatLng } from './location.interface'
import { VehiclePrices } from './price.interface'

export interface ItineraryData {
   prices: VehiclePrices
   distanceMeters: number
   encodedPolyline: string
   estimatedDuration: number
   pickUpLocation: LatLng
   dropOffLocation: LatLng
}
