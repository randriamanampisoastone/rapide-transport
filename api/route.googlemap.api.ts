import axios from 'axios'
import { GOOGLE_DIRECTION_COMPUTE_ROUTE } from 'constants/api.constant'
import { LatLng } from 'interfaces/location.interface'

export const getRouteGoogleMap = async (pickUp: LatLng, dropOff: LatLng) => {
   try {
      const response = await axios.post(
         GOOGLE_DIRECTION_COMPUTE_ROUTE,
         {
            origin: {
               location: {
                  latLng: {
                     latitude: pickUp.latitude,
                     longitude: pickUp.longitude,
                  },
               },
            },
            destination: {
               location: {
                  latLng: {
                     latitude: dropOff.latitude,
                     longitude: dropOff.longitude,
                  },
               },
            },
            routeModifiers: {
               vehicleInfo: {
                  emissionType: 'GASOLINE',
               },
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
         },
         {
            headers: {
               'Content-Type': 'application/json',
               'X-Goog-Api-Key': process.env.GOOGLE_MAP_API_KEY,
               'X-Goog-FieldMask':
                  'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
            },
         },
      )

      return response.data.routes[0]
   } catch (error) {
      throw error
   }
}

// units: 'METRIC',
// trafficModel: 'BEST_GUESS',
// avoid: 'TOLLS',
// alternatives: true,
