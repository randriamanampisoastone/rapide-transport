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
      const clientProfileId = data.clientProfileId
      const clientLocation = data.clientLocation

      const driverProfileId = data.driverProfileId

      server.to(driverProfileId).emit(EVENT_CLIENT_LOCATION, {
         clientProfileId,
         clientLocation,
      })

      server.to(UserRole.ADMIN).emit(EVENT_CLIENT_LOCATION, {
         clientProfileId,
         clientLocation,
      })
   }

   async handleUpdateDriverLocation(
      server: Server,
      data: UpdateDriverLocationInterface,
   ) {
      const driverProfileId = data.driverProfileId
      const driverLocation = data.driverLocation
      const vehicleType = data.vehicleType
      const isOnRide = data.isOnRide

      if (!isOnRide) {
         await this.redisService.addDriverLocationToRedis(
            driverProfileId,
            driverLocation,
            vehicleType,
         )
      } else {
         const clientProfileId = data.clientProfileId

         server.to(clientProfileId).emit(EVENT_DRIVER_LOCATION, {
            driverProfileId,
            driverLocation,
            vehicleType,
         })
      }

      server.to(UserRole.ADMIN).emit(EVENT_DRIVER_LOCATION, {
         driverProfileId,
         driverLocation,
         vehicleType,
         isOnRide,
      })
   }
}
