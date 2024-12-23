export enum ClientRole {
   Client = 'ClientGroup',
   Driver = 'DriverGroup',
   Provider = 'ProviderGroup',
   Admin = 'AdminGroup',
   SuperAdmin = 'SuperAdminGroup',
}

export interface UpdateLocationInterface {
   longitude: number
   latitude: number
}
