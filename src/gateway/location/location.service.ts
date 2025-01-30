import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { InjectModel, Model } from 'nestjs-dynamoose'
import {
   LocationData,
   UpdateDriverLocationInterface,
   UpdateClientLocationInterface,
} from 'interfaces/location.interface'

import { RedisService } from 'src/redis/redis.service'
import { UserRole } from 'enums/profile.enum'

@Injectable()
export class LocationService {
   constructor(
      @InjectModel('Location')
      private locationModel: Model<LocationData, string>,
      private readonly redisService: RedisService,
   ) {}

   async handleUpdateClientLocation(
      server: Server,
      data: UpdateClientLocationInterface,
   ) {
      const clientProfileId = data.clientProfileId
      const clientLocation = data.clientLocation
      const isOnRide = data.isOnRide

      if (isOnRide) {
         const driverProfileId = data.driverProfileId

         server.to(driverProfileId).emit('clientLocation', {
            clientProfileId,
            clientLocation,
         })
      }

      server.to(UserRole.ADMIN).emit('clientLocation', {
         clientProfileId,
         clientLocation,
         isOnRide,
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

         server.to(clientProfileId).emit('driverLocation', {
            driverProfileId,
            driverLocation,
            vehicleType,
         })
      }

      server.to(UserRole.ADMIN).emit('driverLocation', {
         driverProfileId,
         driverLocation,
         vehicleType,
         isOnRide,
      })
   }
}
