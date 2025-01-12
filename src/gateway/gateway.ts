import { Injectable, Logger } from '@nestjs/common'
import {
   ConnectedSocket,
   MessageBody,
   OnGatewayConnection,
   OnGatewayDisconnect,
   OnGatewayInit,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets'
import { CognitoWebSocketService } from 'src/cognito/cognito.websocket.service'
import { Socket, Server } from 'socket.io'
import {
   ClientRole,
   UpdateLocationInterface,
} from './geolocation/geolocation.interface'
import { GeolocationService } from './geolocation/geolocation.service'

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

      const role = user['cognito:groups']?.[0]
      if (!role) {
         this.logger.warn(`User ${user.sub} has no role assigned`)
         client.disconnect(true)
         return null
      }

      return { user, role }
   }
   private assignUserToRoom(client: Socket, role: ClientRole) {
      if (Object.values(ClientRole).includes(role)) {
         client.join(role)
         client.join(client.data.user.sub)
      } else {
         this.logger.warn(`Unknown role: ${role}`)
      }
   }

   @WebSocketServer() server: Server
   private logger: Logger = new Logger('GeolocationGateway')

   constructor(
      private readonly cognitoWebSocketService: CognitoWebSocketService,
      private readonly geolocationService: GeolocationService,
   ) {}

   afterInit(server: Server) {
      server.use(async (socket: Socket, next) => {
         const token = socket.handshake.auth.idToken
         if (!token) {
            return next(new Error('TokenNotFound'))
         }

         try {
            const user = await this.cognitoWebSocketService.validateToken(token)
            socket.data.user = user
            next()
         } catch (error) {
            this.logger.error(`Authentication failed: ${error.message}`)
            return next(new Error('TokenNotInvalid'))
         }
      })
      this.logger.log('GeolocationGateway initialized')
   }
   handleConnection(client: Socket) {
      const validation = this.validateUserRole(client)
      if (!validation) return

      const { role } = validation
      this.assignUserToRoom(client, role)
      this.logger.log(
         `Client connected: ${client.id}, Role: ${role}, User: ${client.data.user.sub}`,
      )
   }

   handleDisconnect(client: Socket) {
      this.logger.log('Client disconnected', client.id)
   }

   @SubscribeMessage('sendData')
   handleData(@MessageBody() data: any) {
      this.server.emit('data', data)
   }

   @SubscribeMessage('updateDriverLocation')
   async handleUpdateDriverLocation(
      @MessageBody() data: UpdateLocationInterface,
      @ConnectedSocket() client: Socket,
   ) {
      await this.geolocationService.handleUpdateDriverLocation(
         this.server,
         data,
         client,
      )
   }

   @SubscribeMessage('driverArrived')
   async handleDriverArrived(@MessageBody() data: { clientId: string }) {
      this.server.to(data.clientId).emit('driverArrived', {})
   }
   @SubscribeMessage('startRide')
   async handleStartRide(@MessageBody() data: { clientId: string }) {
      this.server.to(data.clientId).emit('startRide', {})
   }

   @SubscribeMessage('arrivedDestination')
   async handleArrivedDestination(@MessageBody() data: { clientId: string }) {
      this.server.to(data.clientId).emit('arrivedDestination', {})
   }

   @SubscribeMessage('updateDriverLocationDataBase')
   async handleUpdateDriverLocationDataBase(
      @MessageBody() data: UpdateLocationInterface,
      @ConnectedSocket() client: Socket,
   ) {
      const validation = this.validateUserRole(client)
      if (!validation) return

      const { user } = validation
      await this.geolocationService.handleUpdateDriverLocationDataBase(
         data,
         user,
      )
   }

   @SubscribeMessage('updateClientLocation')
   async handleUpdateClientLocation(
      @MessageBody() data: UpdateLocationInterface,
      @ConnectedSocket() client: Socket,
   ) {
      await this.geolocationService.handleUpdateClientLocation(
         this.server,
         data,
         client,
      )
   }

   sendNotificationToDriver(payload: any) {
      this.server.emit('newRide', payload)
   }
   sendNotificationToClient(
      clientId: string,
      driverId: string,
      estimatedDuration: number,
      encodedPolyline: string,
   ) {
      this.server.to(clientId).emit('acceptedRide', {
         driverId,
         estimatedDuration,
         encodedPolyline,
      })
   }
}
