import { PrismaService } from 'src/prisma/prisma.service'
import { OAuth2Client } from 'google-auth-library'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class GoogleAuthService {
   private WEB_CLIENT_ID_CLIENT =
      '378200763630-4tevtt89ff6g7alvigl1r041ditle8j5.apps.googleusercontent.com'

   private client_google_provider = new OAuth2Client(this.WEB_CLIENT_ID_CLIENT)

   private JWT_SECRET_CLIENT = ''
   private JWT_EXPIRES_IN = ''

   constructor(
      private readonly prismaService: PrismaService,
      private readonly confiService: ConfigService,
   ) {
      this.JWT_SECRET_CLIENT =
         this.confiService.get<string>('JWT_SECRET_CLIENT')
      this.JWT_EXPIRES_IN = this.confiService.get<string>('JWT_EXPIRES_IN')
   }

   async verifyGoogleToken(idToken: string) {
      try {
         const ticket = await this.client_google_provider.verifyIdToken({
            idToken,
            audience: this.WEB_CLIENT_ID_CLIENT,
         })
         const payload = ticket.getPayload()
         return payload
      } catch (error) {
         throw error
      }
   }

   async googleAuth(idToken: string, locale: string) {
      try {
         const { sub, given_name, family_name, picture } =
            await this.verifyGoogleToken(idToken)

         const existingUser = await this.prismaService.profile.findUnique({
            where: { sub },
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
               sub,
               firstName: given_name,
               lastName: family_name,
               profilePhoto: picture,
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
