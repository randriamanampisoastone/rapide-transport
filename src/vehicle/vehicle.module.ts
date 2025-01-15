import { Module } from '@nestjs/common'
import { VehicleService } from './vehicle.service'
import { VehicleController } from './vehicle.controller'
import { RedisService } from 'src/redis/redis.service'

@Module({
   controllers: [VehicleController],
   providers: [VehicleService, RedisService],
})
export class VehicleModule {}
