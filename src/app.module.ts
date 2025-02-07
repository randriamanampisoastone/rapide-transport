import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as ValidationEnv from 'joi'
import { DynamooseModule } from 'nestjs-dynamoose'
import { RedisModule } from './redis/redis.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { RideModule } from './ride/ride.module'
import { GatewayModule } from './gateway/gatway.module'
import { VehicleModule } from './vehicle/vehicle.module'
import { AccountBalanceModule } from './accountBalance/accountBalance.module'
import { HistoricalModule } from './historical/historical.module'

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
            JWT_SECRET: ValidationEnv.string().required(),
            JWT_EXPIRES_IN: ValidationEnv.string().required(),
         }),
      }),
      DynamooseModule.forRootAsync({
         useFactory: async (configService: ConfigService) => ({
            aws: {
               region: configService.get<string>('AWS_REGION'),
            },
         }),
         inject: [ConfigService],
      }),
      RedisModule,
      PrismaModule,
      UserModule,
      RideModule,
      GatewayModule,
      VehicleModule,
      AccountBalanceModule,
      HistoricalModule
   ],
   controllers: [AppController],
   providers: [],
})
export class AppModule {}
