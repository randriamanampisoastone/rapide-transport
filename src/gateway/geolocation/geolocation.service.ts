import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { ClientRole, UpdateLocationInterface } from './geolocation.interface'
import { RedisService } from 'src/redis/redis.service'
import { InjectModel, Model } from 'nestjs-dynamoose'
import { GeolocationData } from './Model/geolocation.model'

@Injectable()
export class GeolocationService {
   constructor(
      private readonly redisService: RedisService,
      @InjectModel('Geolocation')
      private geolocationModel: Model<GeolocationData, string>,
   ) {}

   async handleUpdateClientLocation(
      server: Server,
      data: UpdateLocationInterface,
      client: Socket,
   ) {
      server.to(data.driverId).emit('clientLocation', {
         latitude: data.latLng.latitude,
         longitude: data.latLng.longitude,
         vehicleType: data.vehicleType,
      })
      server.to(ClientRole.Admin).emit('driverLocation', {
         driverId: client.data.user.sub,
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
         // await this.redisService.addGeoLocation(
         //    'DriverGroup',
         //    data.latLng.longitude,
         //    data.latLng.latitude,
         //    client.data.user.sub,
         // )
      } else {
         server.to(data.clientId).emit('driverLocation', {
            latitude: data.latLng.latitude,
            longitude: data.latLng.longitude,
            vehicleType: data.vehicleType,
         })
      }

      server.to(ClientRole.Admin).emit('driverLocation', {
         driverId: client.data.user.sub,
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
         await this.geolocationModel.create({
            userId: user.sub,
            userGroup: role,
            location: data.latLng,
         })
      }
   }
}
