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
import { CancelRideService } from 'src/ride/cancel-ride.service'
import { ComplitRideService } from 'src/ride/complit-ride.service'
import { ClientRideStatusService } from 'src/ride/client-ride-status.service'
import { CalculatePriceService } from 'src/ride/calculate-price.service'

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
      private readonly cancelRideService: CancelRideService,
      private readonly complitRideService: ComplitRideService,
      private readonly clientRideStatusService: ClientRideStatusService,
      private readonly calculePriceService: CalculatePriceService,
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

   sendNotificationToDriver(payload: any, driverId: string) {
      this.server.to(driverId).emit('newRide', payload)
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

   @SubscribeMessage('cancelRide')
   async handleCancelRide(@MessageBody() data: { rideId: string }) {
      await this.cancelRideService.cancelRide(data.rideId)
   }

   @SubscribeMessage('compliteRide')
   async handleComplitRide(@MessageBody() data: { rideId: string }) {
      await this.complitRideService.complitRide(data.rideId)
   }

   @SubscribeMessage('clientGiveUpRide')
   async handleClientGiveUpRide(@MessageBody() data: { rideId: string }) {
      await this.clientRideStatusService.clientGiveUpRide(data.rideId)
   }

   @SubscribeMessage('clientNotFoundRide')
   async handleClientNotFoundRide(@MessageBody() data: { rideId: string }) {
      await this.clientRideStatusService.clientNotFoundRide(data.rideId)
   }

   @SubscribeMessage('calculePrice')
   async calculePrice(@MessageBody() data: { rideId: string, clientId?: string, driverId?: string }) {
      await this.calculePriceService.calculateRealTimePrice(data.rideId)
      if (data.clientId) {
         this.server.to(data.clientId).emit('calculePrice', {})
      }
      else {
         this.server.to(data.driverId).emit('calculePrice', {})
      }
   }
}
