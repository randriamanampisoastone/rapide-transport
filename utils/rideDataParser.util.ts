import { RideData } from 'interfaces/ride.interface'

export const parseRideDataForPostgres = (rideData: RideData) => {
   const { pickUpLocation, dropOffLocation, estimatedPrice, ...dataRest } =
      rideData
   const data = {
      ...dataRest,
      pickUpLocation: JSON.stringify(pickUpLocation),
      dropOffLocation: JSON.stringify(dropOffLocation),
      estimatedPrice: JSON.stringify(estimatedPrice),
   }
   return data
}

export const parseRidePostgresDataForRideData = (
   rideDataFromPostgres,
): RideData => {
   const { pickUpLocation, dropOffLocation, estimatedPrice, ...dataRest } =
      rideDataFromPostgres
   const data: RideData = {
      ...dataRest,
      pickUpLocation: JSON.parse(pickUpLocation),
      dropOffLocation: JSON.parse(dropOffLocation),
      estimatedPrice: JSON.parse(estimatedPrice),
   }
   return data
}
