import { LatLng } from 'interfaces/itinerary'

export enum ClientRole {
   Client = 'ClientGroup',
   Driver = 'DriverGroup',
   Provider = 'ProviderGroup',
   Admin = 'AdminGroup',
   SuperAdmin = 'SuperAdminGroup',
}

export interface UpdateLocationInterface {
   latLng: LatLng
   clientId?: string
   driverId?: string
   vehicleType?: string
   isAvailable: boolean
}
