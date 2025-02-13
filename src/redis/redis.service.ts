import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
   DAILY_RAPIDE_BALANCE,
   DAILY_RAPIDE_RIDE_COMPLET,
   DRIVER_LOCATION_PREFIX,
   NEW_CLIENT,
   RIDE_PREFIX,
} from 'constants/redis.constant'
import { RideStatus } from 'enums/ride.enum'
import { VehicleType } from 'enums/vehicle.enum'
import { getDistance } from 'geolib'
import { DailyRideCompletsInterface } from 'interfaces/daily.ride.complets.interface'
import { DriverLocationRedis } from 'interfaces/driver.interface'
import { LatLng } from 'interfaces/location.interface'
import { RideData } from 'interfaces/ride.interface'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit {
   private client: Redis
   private REDIS_GEO_TTL_SECONDS: number
   private REDIS_TTL_SECONDS: number

   constructor(private readonly configService: ConfigService) {}

   onModuleInit() {
      this.client = new Redis({
         host: this.configService.get<string>('REDIS_HOST'),
         port: this.configService.get<number>('REDIS_PORT'),
      })
      this.REDIS_GEO_TTL_SECONDS = this.configService.get<number>(
         'REDIS_GEO_TTL_SECONDS',
      )
      this.REDIS_TTL_SECONDS =
         this.configService.get<number>('REDIS_TTL_SECONDS')
   }

   async ttl(key: string) {
      return await this.client.ttl(key)
   }
   async expire(key: string, ttl: number) {
      return await this.client.expire(key, ttl)
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
   async remove(key: string): Promise<void> {
      await this.client.del(key)
   }

   async keys(pattern: string) {
      return await this.client.keys(pattern)
   }
   async mget(keys: string[]) {
      return await this.client.mget(keys)
   }

   async addDriverLocationToRedis(
      driverProfileId: string,
      driverLocation: LatLng,
      vehicleType: VehicleType,
      ttl: number = this.REDIS_GEO_TTL_SECONDS,
   ) {
      try {
         await this.set(
            `${DRIVER_LOCATION_PREFIX + driverProfileId}`,
            JSON.stringify({ driverProfileId, driverLocation, vehicleType }),
            ttl,
         )
      } catch (error) {
         console.log(error)
      }
   }

   async getDriversNearby(
      latLng: LatLng,
      vehicleType: VehicleType,
      radiusSteps: number[] = [500, 1000, 2000, 3000, 5000],
   ): Promise<DriverLocationRedis[]> {
      try {
         const drivers = await this.keys(`${DRIVER_LOCATION_PREFIX}*`)

         if (drivers.length > 0) {
            const driversData = await this.mget(drivers)

            let lastFoundDrivers: DriverLocationRedis[] = []

            for (const radius of radiusSteps) {
               const nearbyDrivers: DriverLocationRedis[] = driversData.reduce(
                  (result: DriverLocationRedis[], driverData) => {
                     if (driverData) {
                        const data: DriverLocationRedis = JSON.parse(driverData)

                        const distance = getDistance(
                           {
                              latitude: latLng.latitude,
                              longitude: latLng.longitude,
                           },
                           {
                              latitude: data.driverLocation.latitude,
                              longitude: data.driverLocation.longitude,
                           },
                        )

                        if (
                           distance <= radius &&
                           data.vehicleType === vehicleType
                        ) {
                           result.push({
                              driverProfileId: data.driverProfileId,
                              distance,
                              driverLocation: data.driverLocation,
                              vehicleType: data.vehicleType,
                           })
                        }
                     }

                     return result
                  },
                  [],
               )

               if (nearbyDrivers.length > 0) {
                  lastFoundDrivers = nearbyDrivers
               }
               if (nearbyDrivers.length >= 2) {
                  return nearbyDrivers
               }
            }

            return lastFoundDrivers
         } else {
            return []
         }
      } catch (error) {
         console.error('Error finding nearby drivers:', error)
         return []
      }
   }

   async getRideAvailable() {
      try {
         const rides = await this.keys(`${RIDE_PREFIX}*`)

         if (!rides.length) {
            return []
         }
         const allRides = await this.mget(rides)

         const ridesAvailable: RideData[] = allRides.reduce(
            (result: RideData[], ride: string) => {
               const rideData: RideData = JSON.parse(ride)
               if (rideData.status === RideStatus.FINDING_DRIVER) {
                  result.push(rideData)
               }
               return result
            },
            [],
         )
         return ridesAvailable
      } catch (error) {
         console.error('Error finding nearby drivers:', error)
         return []
      }
   }

   async getRideOnRide() {
      try {
         const rides = await this.keys(`${RIDE_PREFIX}*`)

         if (!rides.length) {
            return []
         }

         const allRides = await this.mget(rides)

         const rideAvailable: RideData[] = allRides.reduce(
            (result: RideData[], ride: string) => {
               const rideData: RideData = JSON.parse(ride)
               if (rideData.status === RideStatus.ON_RIDE) {
                  result.push(rideData)
               }
               return result
            },
            [],
         )
         return rideAvailable
      } catch (error) {
         throw new error()
      }
   }

   async setClientToNew(clientProfileId: string) {
      try {
         await this.set(
            `${NEW_CLIENT}-${clientProfileId}`,
            clientProfileId,
            24 * 3600,
         )
      } catch (error) {
         throw error
      }
   }

   async getNewClients() {
      try {
         const newClients = await this.keys(`${NEW_CLIENT}-*`)
         const data = newClients.reduce((acc, key) => {
            acc.push(key.replace(`${NEW_CLIENT}-`, ''))
            return acc
         }, [])
         return data
      } catch (error) {
         throw error
      }
   }

   async upsertDailyRedisBalance(amount: number) {
      try {
         const dailyRedisBalance = await this.get(DAILY_RAPIDE_BALANCE)

         if (dailyRedisBalance) {
            const ttl = await this.ttl(DAILY_RAPIDE_BALANCE)
            if (ttl > 0) {
               await this.set(
                  DAILY_RAPIDE_BALANCE,
                  (parseInt(dailyRedisBalance) + amount).toString(),
                  ttl,
               )
            }
         } else {
            await this.set(DAILY_RAPIDE_BALANCE, amount.toString(), 24 * 3600)
         }
      } catch (error) {
         throw error
      }
   }

   async newDailyRideComplet(rideId: string) {
      try {
         const dailyRideComplets: DailyRideCompletsInterface = (await this.get(
            DAILY_RAPIDE_RIDE_COMPLET,
         ))
            ? (JSON.parse(
                 await this.get(DAILY_RAPIDE_RIDE_COMPLET),
              ) as DailyRideCompletsInterface)
            : { rideIds: [], count: 0 }
         dailyRideComplets.rideIds.push(rideId)
         dailyRideComplets.count = dailyRideComplets.rideIds.length
         const dailyRideCompletsString = JSON.stringify(dailyRideComplets)
         await this.set(
            DAILY_RAPIDE_RIDE_COMPLET,
            dailyRideCompletsString,
            24 * 3600,
         )
         return dailyRideComplets
      } catch (error) {
         throw error
      }
   }
}
