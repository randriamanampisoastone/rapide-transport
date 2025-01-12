import { VehiclePrices } from './price'

export interface LatLng {
   latitude: number
   longitude: number
}

export interface ItineraryData {
   prices: VehiclePrices
   distanceMeters: number
   encodedPolyline: string
   estimatedDuration: number
   pickUpLocation: LatLng
   dropOffLocation: LatLng
}
