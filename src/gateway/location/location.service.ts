import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
   UpdateDriverLocationInterface,
   UpdateClientLocationInterface,
} from 'interfaces/location.interface'

import { RedisService } from 'src/redis/redis.service'
import { UserRole } from 'enums/profile.enum'
import {
   EVENT_CLIENT_LOCATION,
   EVENT_DRIVER_LOCATION,
} from 'constants/event.constant'

@Injectable()
export class LocationService {
   constructor(private readonly redisService: RedisService) {}

   async handleUpdateClientLocation(
      server: Server,
      data: UpdateClientLocationInterface,
   ) {
      server.to(data.driverProfileId).emit(EVENT_CLIENT_LOCATION, data)
      server.to(UserRole.ADMIN).emit(EVENT_CLIENT_LOCATION, data)
   }

   async handleUpdateDriverLocation(
      server: Server,
      data: UpdateDriverLocationInterface,
   ) {
      if (!data.isAvailable) {
         await this.redisService.addDriverLocationToRedis(data)
      } else {
         server.to(data.clientProfileId).emit(EVENT_DRIVER_LOCATION, data)
      }
      server.to(UserRole.ADMIN).emit(EVENT_DRIVER_LOCATION, data)
   }
}
