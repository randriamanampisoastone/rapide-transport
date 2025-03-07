import { ConfigService } from '@nestjs/config'
import { JwtModuleAsyncOptions } from '@nestjs/jwt'

export const jwtClientConfig: JwtModuleAsyncOptions = {
   useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_CLIENT'),
      signOptions: {
         expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
   }),
   inject: [ConfigService],
}

export const jwtDriverConfig: JwtModuleAsyncOptions = {
   useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_DRIVER'),
      signOptions: {
         expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
   }),
   inject: [ConfigService],
}

export const jwtAdminConfig: JwtModuleAsyncOptions = {
   useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_ADMIN'),
      signOptions: {
         expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
   }),
   inject: [ConfigService],
}
