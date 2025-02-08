import { ConfigService } from '@nestjs/config'
import { JwtModuleAsyncOptions } from '@nestjs/jwt'

export const jwtClientConfig: JwtModuleAsyncOptions = {
   useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_CLIENT'),
      signOptions: {
         algorithm: 'RS256',
         expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
   }),
   inject: [ConfigService],
}

export const jwtDriverConfig: JwtModuleAsyncOptions = {
   useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_DRIVER'),
      signOptions: {
         algorithm: 'RS256',
         expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
   }),
   inject: [ConfigService],
}

export const jwtAdminConfig: JwtModuleAsyncOptions = {
   useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_ADMIN'),
      signOptions: {
         algorithm: 'RS256',
         expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
   }),
   inject: [ConfigService],
}
