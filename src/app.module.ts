import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import * as ValidationEnv from 'joi'
import { RedisModule } from './redis/redis.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { RideModule } from './ride/ride.module'
import { GatewayModule } from './gateway/gatway.module'
import { VehicleModule } from './vehicle/vehicle.module'
import { AccountBalanceModule } from './accountBalance/accountBalance.module'
import { HistoricalModule } from './historical/historical.module'
import { TaskPlanModule } from './taskPlan/task.plan.module'
import { HomeModule } from './home/home.module'

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         validationSchema: ValidationEnv.object({
            PORT: ValidationEnv.number().required(),
            AWS_REGION: ValidationEnv.string().required(),
            REDIS_HOST: ValidationEnv.string().required(),
            REDIS_PORT: ValidationEnv.number().required(),
            REDIS_GEO_TTL_SECONDS: ValidationEnv.number().required(),
            REDIS_TTL_SECONDS: ValidationEnv.number().required(),
            DATABASE_URL: ValidationEnv.string().required(),
            RADIUS_FINDING_DRIVER: ValidationEnv.number().required(),
            JWT_SECRET_CLIENT: ValidationEnv.string().required(),
            JWT_SECRET_DRIVER: ValidationEnv.string().required(),
            JWT_SECRET_ADMIN: ValidationEnv.string().required(),
            JWT_EXPIRES_IN: ValidationEnv.string().required(),
         }),
      }),
      RedisModule,
      PrismaModule,
      UserModule,
      RideModule,
      GatewayModule,
      VehicleModule,
      AccountBalanceModule,
      HistoricalModule,
      TaskPlanModule,
      HomeModule
   ],
   controllers: [AppController],
   providers: [],
})
export class AppModule {}
