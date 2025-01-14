import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
   CLIENT_LOCATION_PREFIX,
   DRIVER_LOCATION_PREFIX,
} from 'constants/redis.constant'
import { getDistance } from 'geolib'
import { DriverLocationRedis } from 'interfaces/driver.interface'
import { LatLng } from 'interfaces/location.interface'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit {
   private client: Redis
   private REDIS_GEO_TTL_SECONDS: number
   private REDIS_TTL_SECONDS: number
   private RADIUS_FINDING_DRIVER: number

   constructor(private readonly configService: ConfigService) {}

   onModuleInit() {
      this.client = new Redis({
         host: this.configService.get<string>('REDIS_HOST'),
         port: this.configService.get<number>('REDIS_PORT'),
      })
      this.REDIS_GEO_TTL_SECONDS = this.configService.get<number>(
         'REDIS_GEO_TTL_SECONDS',
      )

      this.RADIUS_FINDING_DRIVER = this.configService.get(
         'RADIUS_FINDING_DRIVER',
      )
   }

   async get(key: string) {
      return await this.client.get(key)
   }
   async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
      await this.client.set(
         key,
         value,
         'EX',
         ttlSeconds ?? this.REDIS_TTL_SECONDS,
      )
   }

   async keys(pattern: string) {
      return await this.client.keys(pattern)
   }
   async mget(keys: string[]) {
      return await this.client.mget(keys)
   }

   async addDriverLocationToRedis(
      latLng: LatLng,
      driverProfileId: string,
      ttl: number = this.REDIS_GEO_TTL_SECONDS,
   ) {
      try {
         await this.set(
            `${DRIVER_LOCATION_PREFIX + driverProfileId}`,
            JSON.stringify(latLng),
            ttl,
         )
      } catch (error) {
         console.log(error)
      }
   }

   async addClientLocationToRedis(
      latLng: LatLng,
      clientProfileId: string,
      ttl: number = this.REDIS_GEO_TTL_SECONDS,
   ) {
      await this.set(
         `${CLIENT_LOCATION_PREFIX + clientProfileId}`,
         JSON.stringify(latLng),
         ttl,
      )
   }

   async getDriversNearby(
      latLng: LatLng,
      radius: number = this.RADIUS_FINDING_DRIVER,
   ) {
      try {
         const drivers = await this.keys(`${DRIVER_LOCATION_PREFIX}*`)

         const driverLocations = await Promise.all(
            drivers.map((driver) => this.get(driver)),
         )

         const nearbyDrivers: DriverLocationRedis[] = drivers.reduce(
            (result, driver, index) => {
               const driverLocation = driverLocations[index]

               if (driverLocation) {
                  const distance = getDistance(
                     {
                        latitude: latLng.latitude,
                        longitude: latLng.longitude,
                     },
                     JSON.parse(driverLocation),
                  )

                  if (distance < radius) {
                     result.push({
                        driverProfileId: driver.replace(
                           DRIVER_LOCATION_PREFIX,
                           '',
                        ),
                        distance,
                        latLng: JSON.parse(driverLocation),
                     })
                  }
               }

               return result
            },
            [],
         )

         return nearbyDrivers
      } catch (error) {
         console.error('Error finding nearby drivers:', error)
         return []
      }
   }

   async getClientsNearby(
      latLng: LatLng,
      radius: number = this.RADIUS_FINDING_DRIVER,
   ) {
      try {
         const clients = await this.keys(`${CLIENT_LOCATION_PREFIX}*`)

         const clientLocations = await Promise.all(
            clients.map((client) => this.get(client)),
         )

         const nearbyClients = clients.reduce((result, client, index) => {
            const clientLocation = clientLocations[index]

            if (clientLocation) {
               const distance = getDistance(
                  {
                     latitude: latLng.latitude,
                     longitude: latLng.longitude,
                  },
                  JSON.parse(clientLocation),
               )

               if (distance < radius) {
                  result.push({
                     driverProfileId: client.replace(
                        CLIENT_LOCATION_PREFIX,
                        '',
                     ),
                     distance,
                     latLng: JSON.parse(clientLocation),
                  })
               }
            }

            return result
         }, [])

         return nearbyClients
      } catch (error) {
         console.error('Error finding nearby drivers:', error)
         return []
      }
   }
}
