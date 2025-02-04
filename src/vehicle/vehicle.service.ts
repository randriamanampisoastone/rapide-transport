import { Injectable } from '@nestjs/common'
import { VehicleType } from 'enums/vehicle.enum'
import { LatLng } from 'interfaces/location.interface'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class VehicleService {
   constructor(private readonly redisService: RedisService) {}

   async findingDriversNearBy(latLng: LatLng) {
      const motos = await this.redisService.getDriversNearby(
         latLng,
         VehicleType.MOTO,
         [2000],
      )
      const lite_cars = await this.redisService.getDriversNearby(
         latLng,
         VehicleType.LITE_CAR,
         [2000],
      )
      const premium_cars = await this.redisService.getDriversNearby(
         latLng,
         VehicleType.PREMIUM_CAR,
         [2000],
      )

      return {
         drivers: [...motos, ...lite_cars, ...premium_cars],
         motoDrivers: motos.length,
         liteCarDrivers: lite_cars.length,
         premiumCarDrivers: premium_cars.length,
      }
   }
}
