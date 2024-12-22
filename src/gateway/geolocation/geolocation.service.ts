import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ClientRole } from './geolocation.interface';
import { RedisService } from 'src/redis/redis.service';
import { UpdateLocationDto } from './Dto/updata.location.dto';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GeolocationData } from './Model/geolocation.model';

@Injectable()
export class GeolocationService {
  constructor(
    private readonly redisService: RedisService,
    @InjectModel('Geolocation')
    private geolocationModel: Model<GeolocationData, string>,
  ) {}

  async handleUpdateClientLocation(
    server: Server,
    data: UpdateLocationDto,
    user: any,
  ) {
    const role = user['cognito:groups']?.[0];
    if (role === ClientRole.Client) {
      server.to(ClientRole.Admin).emit('clientLocation', {
        userId: user.sub,
        userGroup: role,
        location: data,
      });
    }
  }

  async handleUpdateDriverLocation(
    server: Server,
    data: UpdateLocationDto,
    user: any,
  ) {
    const role = user['cognito:groups']?.[0];
    if (role === ClientRole.Driver) {
      await this.redisService.addGeoLocation(
        role,
        data.longitude,
        data.latitude,
        user.sub,
      );
      server.to(ClientRole.Admin).emit('driverLocation', {
        userId: user.sub,
        userGroup: role,
        location: data,
      });
    }
  }

  async handleUpdateDriverLocationDataBase(data: UpdateLocationDto, user: any) {
    const role = user['cognito:groups']?.[0];
    if (role === ClientRole.Driver) {
      await this.geolocationModel.create({
        userId: user.sub,
        userGroup: role,
        location: data,
      });
    }
  }
}
