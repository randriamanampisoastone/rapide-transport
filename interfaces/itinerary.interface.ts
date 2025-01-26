import { LatLng } from './location.interface'
import { RidePrices } from './price.interface'

export interface ItineraryData {
   pickUpLocation: LatLng
   dropOffLocation: LatLng
   encodedPolyline: string
   distanceMeters: number
   estimatedDuration: number
   prices: RidePrices
}
