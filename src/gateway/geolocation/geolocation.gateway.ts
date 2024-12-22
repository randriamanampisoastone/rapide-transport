import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { CognitoService } from 'src/cognito/cognito.service';
import { Socket, Server } from 'socket.io';
import { ClientRole, UpdateLocationInterface } from './geolocation.interface';
import { GeolocationService } from './geolocation.service';

@WebSocketGateway()
export class GeolocationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GeolocationGateway');

  constructor(
    private readonly cognitoService: CognitoService,
    private readonly geolocationService: GeolocationService, // Injecter le service
  ) {}

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      const token = socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Token is required for authentication.'));
      }

      try {
        const user = await this.cognitoService.validateToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        this.logger.error(`Authentication failed: ${error.message}`);
        return next(new Error('Invalid or expired token.'));
      }
    });
    this.logger.log('GeolocationGateway initialized');
  }
  handleConnection(client: Socket) {
    const validation = this.validateUserRole(client);
    if (!validation) return;

    const { role } = validation;
    this.assignUserToRoom(client, role);
    this.logger.log(`Client connected: ${client.id}, Role: ${role}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected', client.id);
  }

  @SubscribeMessage('updateClientLocation')
  handleUpdateClientLocation(
    @MessageBody() data: UpdateLocationInterface,
    @ConnectedSocket() client: Socket,
  ) {
    const validation = this.validateUserRole(client);
    if (!validation) return;

    const { user } = validation;
    this.geolocationService.handleUpdateClientLocation(this.server, data, user);
  }

  @SubscribeMessage('updateDriverLocation')
  async handleUpdateDriverLocation(
    @MessageBody() data: UpdateLocationInterface,
    @ConnectedSocket() client: Socket,
  ) {
    const validation = this.validateUserRole(client);
    if (!validation) return;

    const { user } = validation;
    await this.geolocationService.handleUpdateDriverLocation(
      this.server,
      data,
      user,
    );
  }

  @SubscribeMessage('updateDriverLocationDataBase')
  async handleUpdateDriverLocationDataBase(
    @MessageBody() data: UpdateLocationInterface,
    @ConnectedSocket() client: Socket,
  ) {
    const validation = this.validateUserRole(client);
    if (!validation) return;

    const { user } = validation;
    await this.geolocationService.handleUpdateDriverLocationDataBase(
      data,
      user,
    );
  }

  private validateUserRole(client: Socket) {
    const user = client.data.user;
    if (!user) {
      this.logger.warn('Unauthorized client');
      client.disconnect(true);
      return null;
    }

    const role = user['cognito:groups']?.[0];
    if (!role) {
      this.logger.warn(`User ${user.sub} has no role assigned`);
      client.disconnect(true);
      return null;
    }

    return { user, role };
  }
  private assignUserToRoom(client: Socket, role: ClientRole) {
    if (Object.values(ClientRole).includes(role)) {
      client.join(role);
    } else {
      this.logger.warn(`Unknown role: ${role}`);
    }
  }
}
