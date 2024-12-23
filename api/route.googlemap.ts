import axios from 'axios'

interface LatLng {
   latitude: number
   longitude: number
}

export const getRouteGoogleMap = async (
   origin: LatLng,
   destination: LatLng,
   API_KEY: string,
) => {
   const url = 'https://routes.googleapis.com/directions/v2:computeRoutes'

   try {
      const response = await axios.post(
         url,
         {
            origin: {
               location: {
                  latLng: {
                     latitude: origin.latitude,
                     longitude: origin.longitude,
                  },
               },
            },
            destination: {
               location: {
                  latLng: {
                     latitude: destination.latitude,
                     longitude: destination.longitude,
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
               'X-Goog-Api-Key': API_KEY,
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
