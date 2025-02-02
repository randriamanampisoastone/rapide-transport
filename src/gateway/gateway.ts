import { Injectable, Logger } from '@nestjs/common'
import {
   MessageBody,
   OnGatewayConnection,
   OnGatewayDisconnect,
   OnGatewayInit,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets'

import { Socket, Server } from 'socket.io'

import { LocationService } from './location/location.service'
import {
   UpdateClientLocationInterface,
   UpdateDriverLocationInterface,
} from 'interfaces/location.interface'
import { InfoOnRideService } from 'src/ride/info-on-ride.service'
import { CheckRideService } from 'src/ride/check-ride.service'
import { RideData } from 'interfaces/ride.interface'
import { JwtService } from '@nestjs/jwt'
import { UserRole } from 'enums/profile.enum'

@Injectable()
@WebSocketGateway({ cors: true })
export class Gateway
   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
   private validateUserRole(client: Socket) {
      const user = client.data.user
      if (!user) {
         this.logger.warn('Unauthorized client')
         client.disconnect(true)
         return null
      }

      const role = user.role
      if (!role) {
         this.logger.warn(`User ${user.sub} has no role assigned`)
         client.disconnect(true)
         return null
      }

      return { user, role }
   }
   private assignUserToRoom(client: Socket, role: UserRole) {
      if (Object.values(UserRole).includes(role)) {
         client.join(role)
         if (client.data.user.clientProfileId) {
            console.log('llllllleeeeoooo')

            client.join(client.data.user.clientProfileId)
         } else if (client.data.user.driverProfileId)
            client.join(client.data.user.driverProfileId)
      } else {
         this.logger.warn(`Unknown role: ${role}`)
      }
   }

   @WebSocketServer() server: Server
   private logger: Logger = new Logger('GeolocationGateway')

   constructor(
      private readonly locationService: LocationService,
      private readonly infoOnRideService: InfoOnRideService,
      private readonly checkRideService: CheckRideService,
      private readonly jwtService: JwtService,
   ) {}

   afterInit(server: Server) {
      server.use(async (socket: Socket, next) => {
         const token = socket.handshake.auth.token
         if (!token) {
            return next(new Error('TokenNotFound'))
         }
         try {
            const user = await this.jwtService.verify(token)
            socket.data.user = user

            next()
         } catch (error) {
            this.logger.error(`Authentication failed: ${error.message}`)
            return next(new Error('TokenNotInvalid'))
         }
      })

      this.logger.log('GeolocationGateway initialized')
   }
   async handleConnection(client: Socket) {
      const validation = this.validateUserRole(client)
      if (!validation) return

      const { role } = validation
      console.log('role:', role)

      this.assignUserToRoom(client, role)
      this.logger.log(
         `Connected: ${client.id}, Role: ${role}, User: ${client.data.user}`,
      )
      try {
         let ride: RideData
         if (role === UserRole.CLIENT) {
            ride = await this.checkRideService.checkClientRide(
               client.data.user.clientProfileId,
            )
         } else if (role === UserRole.DRIVER) {
            ride = await this.checkRideService.checkDriverRide(
               client.data.user.driverProfileId,
            )
         }

         if (ride) {
            client.emit('rideChecked', { success: true, ride })
         } else {
            client.emit('rideChecked', {
               success: false,
               message: 'No ride found',
            })
         }
      } catch (error) {
         console.log(error)
         client.emit('rideChecked', {
            success: false,
            message: 'Error checking ride',
         })
      }
   }

   handleDisconnect(client: Socket) {
      this.logger.log(`'Disconnected : ${client.id}`)
   }

   @SubscribeMessage('updateDriverLocation')
   async handleUpdateDriverLocation(
      @MessageBody() data: UpdateDriverLocationInterface,
   ) {
      await this.locationService.handleUpdateDriverLocation(this.server, data)
   }

   @SubscribeMessage('updateClientLocation')
   async handleUpdateClientLocation(
      @MessageBody() data: UpdateClientLocationInterface,
   ) {
      await this.locationService.handleUpdateClientLocation(this.server, data)
   }

   @SubscribeMessage('notifyClient')
   async notifyClient(@MessageBody() data: { clientProfileId: string }) {
      console.log('notifyClient', data)

      this.server.to(data.clientProfileId).emit('notifyClient', {})
   }

   sendNotificationToDriver(
      driverProfileId: string,
      topic: string,
      payload: any,
   ) {
      this.server.to(driverProfileId).emit(topic, payload)
   }

   sendNotificationToClient(
      clientProfileId: string,
      topic: string,
      payload: any,
   ) {
      this.server.to(clientProfileId).emit(topic, payload)
   }

   @SubscribeMessage('infoOnRidePush')
   async calculePrice(
      @MessageBody()
      data: {
         rideId: string
         clientProfileId: string
         driverProfileId: string
      },
   ) {
      await this.infoOnRideService.infoOnRide(
         data.rideId,
         data.clientProfileId,
         data.driverProfileId,
         this.server,
      )
   }
}
