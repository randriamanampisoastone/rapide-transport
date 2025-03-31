import {
   BadRequestException,
   Injectable,
   Logger,
   UnauthorizedException,
} from '@nestjs/common'
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
import { UserRole } from 'enums/profile.enum'
import * as jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import {
   EVENT_INFO_ON_RIDE_PUSH,
   EVENT_NOTIFY_CLIENT,
   EVENT_REGISTER_EXPO_PUSH_TOKEN,
   EVENT_SEND_DATA,
   EVENT_UPDATE_CLIENT_LOCATION,
   EVENT_UPDATE_DRIVER_LOCATION,
} from 'constants/event.constant'
import { NotificationInterface } from 'interfaces/notification.interface'
import { NotificationService } from 'src/notification/notification.service'
import {
   ERROR_TOKEN_NOT_FOUND,
   ERROR_UNAUTHORIZED,
} from 'constants/error.constant'

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
         client.join(client.data.user.sub)
      }
   }

   @WebSocketServer() server: Server
   private logger: Logger = new Logger('GeolocationGateway')

   constructor(
      private readonly locationService: LocationService,
      private readonly notificationService: NotificationService,
      private readonly infoOnRideService: InfoOnRideService,
      private readonly configService: ConfigService,
   ) {}

   afterInit(server: Server) {
      server.use(async (socket: Socket, next) => {
         const token = socket.handshake.auth.token
         if (!token) {
            return next(new BadRequestException(ERROR_TOKEN_NOT_FOUND))
         }

         try {
            const decodedHeader: any = jwt.decode(token)
            if (!decodedHeader || !decodedHeader.role) {
               throw new UnauthorizedException(ERROR_UNAUTHORIZED)
            }

            let secretKey: string
            switch (decodedHeader.role) {
               case UserRole.CLIENT:
                  secretKey =
                     this.configService.get<string>('JWT_SECRET_CLIENT')
                  break
               case UserRole.DRIVER:
                  secretKey =
                     this.configService.get<string>('JWT_SECRET_DRIVER')
                  break
               case UserRole.SUPER_ADMIN:
               case UserRole.CALL_CENTER:
               case UserRole.DEPOSITOR:
               case UserRole.MANAGER_HUB:
               case UserRole.RIDER:
               case UserRole.TREASURER:
                  secretKey = this.configService.get<string>('JWT_SECRET_ADMIN')
                  break
               default:
                  throw new UnauthorizedException(
                     `Rôle invalide: ${decodedHeader.role}`,
                  )
            }

            // Vérification du token avec la bonne clé secrète
            const user = jwt.verify(token, secretKey)

            socket.data.user = user

            next()
         } catch (error) {
            this.logger.error(`Authentication failed: ${error.message}`)
            return next(new BadRequestException(ERROR_UNAUTHORIZED))
         }
      })

      this.logger.log('GeolocationGateway initialized')
   }
   async handleConnection(client: Socket) {
      const validation = this.validateUserRole(client)
      if (!validation) return

      const { role } = validation

      this.assignUserToRoom(client, role)
      this.logger.log(
         `Connected: ${client.id}, Role: ${role}, User: ${client.data.user}`,
      )
   }

   handleDisconnect(client: Socket) {
      this.logger.log(`Disconnected : ${client.id}`)
   }

   @SubscribeMessage(EVENT_REGISTER_EXPO_PUSH_TOKEN)
   async registerExpoPushToken(@MessageBody() data: NotificationInterface) {
      await this.notificationService.registerExpoPushToken(data)
   }

   @SubscribeMessage(EVENT_UPDATE_DRIVER_LOCATION)
   async handleUpdateDriverLocation(
      @MessageBody() data: UpdateDriverLocationInterface,
   ) {
      await this.locationService.handleUpdateDriverLocation(this.server, data)
   }

   @SubscribeMessage(EVENT_UPDATE_CLIENT_LOCATION)
   async handleUpdateClientLocation(
      @MessageBody() data: UpdateClientLocationInterface,
   ) {
      await this.locationService.handleUpdateClientLocation(this.server, data)
   }
   @SubscribeMessage(EVENT_SEND_DATA)
   async handleSendData(@MessageBody() data: any) {
      console.log('Tonga : ', data)
   }

   @SubscribeMessage(EVENT_NOTIFY_CLIENT)
   async notifyClient(@MessageBody() data: { clientProfileId: string }) {
      this.server.to(data.clientProfileId).emit(EVENT_NOTIFY_CLIENT, {})
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

   sendNotificationToAdmin(roles: UserRole[], topic: string, payload: any) {
      for (let role of roles) this.server.to(role).emit(topic, payload)
   }

   sendNotificationToSpecificAdmin(
      adminProfileId: string,
      topic: string,
      payload: any,
   ) {
      this.server.to(adminProfileId).emit(topic, payload)
   }

   @SubscribeMessage(EVENT_INFO_ON_RIDE_PUSH)
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
