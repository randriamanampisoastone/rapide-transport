import { Injectable } from '@nestjs/common'
import { LatLng } from 'interfaces/location.interface'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class VehicleService {
   constructor(private readonly redisService: RedisService) {}

   findingDriversNearBy(latLng: LatLng, radius?: number) {
      return this.redisService.getDriversNearby(latLng, radius)
   }
}
