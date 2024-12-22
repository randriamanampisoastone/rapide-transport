import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GeolocationGateway } from './gateway/geolocation/geolocation.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as ValidationEnv from 'joi';
import { CognitoModule } from './cognito/cognito.module';
import { CognitoAuthModule } from '@nestjs-cognito/auth';
import { SqsModule } from '@ssut/nestjs-sqs';
import { DynamooseModule } from 'nestjs-dynamoose';
import { RedisModule } from './redis/redis.module';
import { GeolocationService } from './gateway/geolocation/geolocation.service';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ValidationEnv.object({
        PORT: ValidationEnv.number().required(),
        AWS_COGNITO_JWKS_URI: ValidationEnv.string().required(),
        AWS_COGNITO_ISSUER: ValidationEnv.string().required(),
        REDIS_HOST: ValidationEnv.string().required(),
        REDIS_PORT: ValidationEnv.number().required(),
        REDIS_GEO_TTL_SECONDS: ValidationEnv.number().required(),
        REDIS_TTL_SECONDS: ValidationEnv.number().required(),
      }),
    }),
    CognitoAuthModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        jwtVerifier: {
          userPoolId: configService.get<string>('COGNITO_USER_POOL_ID'),
          clientId: configService.get<string>('COGNITO_CLIENT_ID'),
          tokenUse: 'id',
        },
      }),
      inject: [ConfigService],
    }),
    CognitoModule,
    SqsModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          consumers: [
            {
              name: configService.get<string>('SMS_QUEUE_NAME'),
              queueUrl: configService.get<string>('SMS_QUEUE_URL'),
              region: configService.get<string>('AWS_REGION'),
            },
          ],
        };
      },
      inject: [ConfigService],
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
    OrderModule,
  ],
  controllers: [AppController],
  providers: [GeolocationGateway, GeolocationService],
})
export class AppModule {}
