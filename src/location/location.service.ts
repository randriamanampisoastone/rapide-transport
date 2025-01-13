import { Injectable } from '@nestjs/common'
import { LatLng } from 'interfaces/itinerary'
import { RedisService } from 'src/redis/redis.service'
import { getDistance } from 'geolib'

@Injectable()
export class LocationService {
   constructor(private readonly redisService: RedisService) {}

   async addDriverLocation(latLng: LatLng, driverId: string, ttl: number = 5) {
      try {
         await this.redisService.set(
            `driver-${driverId}`,
            JSON.stringify(latLng),
            ttl,
         )
      } catch (error) {
         console.log(error)
      }
   }

   async addClientLocation(latLng: LatLng, clientId: string, ttl: number = 5) {
      await this.redisService.set(
         `client-${clientId}`,
         JSON.stringify(latLng),
         ttl,
      )
   }

   async getDriversNearby(latLng: LatLng, radius: number = 2000) {
      const drivers = await this.redisService.keys('driver-*')
      const nearbyDriver = await Promise.all(
         drivers.map(async (driver) => {
            const driverLocation = await this.redisService.get(driver)
            const distance = getDistance(
               {
                  latitude: latLng.latitude,
                  longitude: latLng.longitude,
               },
               JSON.parse(driverLocation),
            )
            if (distance < radius) {
               const res = {
                  driverId: driver,
                  distance,
                  latLag: JSON.parse(driverLocation),
               }
               console.log(res)
               return res
            }

            return null
         }),
      )

      return nearbyDriver.filter((driver) => driver !== null)
   }

   async getClientNearby(latLng: LatLng, radius: number = 2000) {
      const clients = await this.redisService.keys('client-*')
      const nearbyClient = await Promise.all(
         clients.map(async (client) => {
            const clientLocation = await this.redisService.get(client)
            const distance = getDistance(
               {
                  latitude: latLng.latitude,
                  longitude: latLng.longitude,
               },
               JSON.parse(clientLocation),
            )
            if (distance < radius) {
               const res = {
                  clientId: client,
                  distance,
                  latLag: JSON.parse(clientLocation),
               }
               return res
            }

            return null
         }),
      )

      return nearbyClient.filter((client) => client !== null)
   }
}
