import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { InjectModel, Model } from 'nestjs-dynamoose'
import {
   LocationData,
   UpdateLocationInterface,
} from 'interfaces/location.interface'

import { ClientRole } from 'interfaces/user.inteface'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class LocationService {
   constructor(
      @InjectModel('Location')
      private locationModel: Model<LocationData, string>,
      private readonly redisService: RedisService,
   ) {}

   async handleUpdateClientLocation(
      server: Server,
      data: UpdateLocationInterface,
      client: Socket,
   ) {
      server.to(data.driverProfileId).emit('clientLocation', {
         latitude: data.latLng.latitude,
         longitude: data.latLng.longitude,
         vehicleType: data.vehicleType,
      })
      server.to(ClientRole.Admin).emit('clientLocation', {
         driverProfileId: client.data.user.sub,
         userGroup: 'ClientGroup',
         latLng: data.latLng,
      })
   }

   async handleUpdateDriverLocation(
      server: Server,
      data: UpdateLocationInterface,
      client: Socket,
   ) {
      if (data.isAvailable) {
         await this.redisService.addDriverLocationToRedis(
            data.latLng,
            data.driverProfileId,
            data.vehicleType,
         )
      } else {
         server.to(data.clientProfileId).emit('driverLocation', {
            latitude: data.latLng.latitude,
            longitude: data.latLng.longitude,
            vehicleType: data.vehicleType,
         })
      }

      server.to(ClientRole.Admin).emit('driverLocation', {
         driverProfileId: client.data.user.sub,
         userGroup: 'DriverGroup',
         latLng: data.latLng,
      })
   }

   async handleUpdateDriverLocationDataBase(
      data: UpdateLocationInterface,
      user: any,
   ) {
      const role = user['cognito:groups']?.[0]
      if (role === ClientRole.Driver) {
         await this.locationModel.create({
            userId: user.sub,
            userGroup: role,
            location: data.latLng,
         })
      }
   }
}
