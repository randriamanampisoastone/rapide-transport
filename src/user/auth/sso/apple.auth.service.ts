/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import { createRemoteJWKSet, jwtVerify } from 'jose'

@Injectable()
export class AppleAuthService {
   private JWT_SECRET_CLIENT = ''
   private JWT_EXPIRES_IN = ''
   private APPLE_PUBLIC_KEY_URL = ''
   private APP_IDENTIFIER = ''
   private ISSUER = 'https://appleid.apple.com'

   constructor(
      private readonly prismaService: PrismaService,
      private readonly confiService: ConfigService,
   ) {
      this.JWT_SECRET_CLIENT =
         this.confiService.get<string>('JWT_SECRET_CLIENT')
      this.JWT_EXPIRES_IN = this.confiService.get<string>('JWT_EXPIRES_IN')
      this.APPLE_PUBLIC_KEY_URL = this.confiService.get<string>(
         'APPLE_PUBLIC_KEY_URL',
      )
      this.APP_IDENTIFIER = this.confiService.get<string>('APP_IDENTIFIER')
   }

   public async verifyAppleToken(idToken: string) {
      try {
         const JWKS = createRemoteJWKSet(new URL(this.APPLE_PUBLIC_KEY_URL))
         const { payload } = await jwtVerify(idToken, JWKS, {
            issuer: this.ISSUER,
            audience: this.APP_IDENTIFIER,
         })
         console.log({
            valid: true,
            payload,
         })

         return {
            valid: true,
            payload,
         }
      } catch (error) {
         return {
            valid: false,
            error: error.message,
         }
      }
   }

   async appleAuth(
      idToken: string,
      locale: string,
      firstName?: string,
      lastName?: string,
   ) {
      try {
         const { valid, payload } = await this.verifyAppleToken(idToken)

         if (!valid) throw new InternalServerErrorException('Invalid token')

         const existingUser = await this.prismaService.profile.findUnique({
            where: { sub: payload.sub },
            include: {
               clientProfile: {
                  include: {
                     rapideWallet: {
                        select: {
                           status: true,
                        },
                     },
                  },
               },
               driverProfile: {
                  include: {
                     rapideWallet: {
                        select: {
                           status: true,
                        },
                     },
                  },
               },
               adminProfile: true,
            },
         })

         if (!existingUser) {
            return {
               sub: payload.sub,
               firstName,
               lastName,
               status: 'NOT_REGISTERED',
            }
         }

         const token = jwt.sign(
            {
               sub: existingUser.sub,
               role: existingUser.role,
               status: existingUser.clientProfile.status,
               rapideWalletStatus:
                  existingUser.clientProfile.rapideWallet.status,
               locale,
            },
            this.JWT_SECRET_CLIENT,
            {
               expiresIn: this.JWT_EXPIRES_IN,
            },
         )
         return { token, status: 'REGISTERED' }
      } catch (error) {
         throw error
      }
   }
}
