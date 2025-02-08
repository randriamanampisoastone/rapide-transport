import { PrismaService } from 'src/prisma/prisma.service'
import { OAuth2Client } from 'google-auth-library'
import { UserRole } from 'enums/profile.enum'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class GoogleAuthService {
   private WEB_CLIENT_ID =
      '378200763630-4tevtt89ff6g7alvigl1r041ditle8j5.apps.googleusercontent.com'
   private client = new OAuth2Client(this.WEB_CLIENT_ID)

   private JWT_SECRET_CLIENT = ''
   private JWT_SECRET_DRIVER = ''
   private JWT_SECRET_ADMIN = ''
   private JWT_EXPIRES_IN = ''

   constructor(
      private readonly prismaService: PrismaService,
      private readonly confiService: ConfigService,
   ) {
      this.JWT_SECRET_CLIENT =
         this.confiService.get<string>('JWT_SECRET_CLIENT')
      this.JWT_SECRET_DRIVER =
         this.confiService.get<string>('JWT_SECRET_DRIVER')
      this.JWT_SECRET_ADMIN = this.confiService.get<string>('JWT_SECRET_ADMIN')
      this.JWT_EXPIRES_IN = this.confiService.get<string>('JWT_EXPIRES_IN')
   }

   async verifyGoogleToken(
      idToken: string,
      userRole: UserRole = UserRole.CLIENT,
   ) {
      try {
         if (userRole === UserRole.CLIENT) {
            const ticket = await this.client.verifyIdToken({
               idToken,
               audience: this.WEB_CLIENT_ID,
            })
            const payload = ticket.getPayload()
            return payload
         }
      } catch (error) {
         throw error
      }
   }

   async googleAuth(idToken: string) {
      try {
         const payload = await this.verifyGoogleToken(idToken)

         const existingUser = await this.prismaService.profile.findUnique({
            where: { email: payload.email },
            include: {
               clientProfile: true,
               driverProfile: true,
               adminProfile: true,
            },
         })

         if (!existingUser) {
            return {
               email: payload.email,
               firstName: payload.given_name,
               lastName: payload.family_name,
               profilePhoto: payload.picture,
               status: 'NOT_REGISTERED',
            }
         }

         if (existingUser.role === UserRole.CLIENT) {
            const updateClientProfile = {
               clientProfileId: existingUser.clientProfile.clientProfileId,
               firstName: existingUser.firstName,
               lastName: existingUser.lastName,
               birthday: existingUser.birthday,
               gender: existingUser.gender,
               phoneNumber: existingUser.phoneNumber,
               profilePhoto: existingUser.profilePhoto,
               role: existingUser.role,
               status: existingUser.clientProfile.status,
            }
            const token = jwt.sign(
               updateClientProfile,
               this.JWT_SECRET_CLIENT,
               {
                  expiresIn: this.JWT_EXPIRES_IN,
               },
            )
            return { token, status: 'REGISTERED' }
         } else if (existingUser.role === UserRole.DRIVER) {
            const updateDriverProfile = {
               driverProfileId: existingUser.driverProfile.driverProfileId,
               firstName: existingUser.firstName,
               lastName: existingUser.lastName,
               birthday: existingUser.birthday,
               gender: existingUser.gender,
               phoneNumber: existingUser.phoneNumber,
               profilePhoto: existingUser.profilePhoto,
               role: existingUser.role,
               status: existingUser.driverProfile.status,
            }
            const token = jwt.sign(
               updateDriverProfile,
               this.JWT_SECRET_DRIVER,
               {
                  expiresIn: this.JWT_EXPIRES_IN,
               },
            )
            return { token, status: 'REGISTERED' }
         } else if (existingUser.role === UserRole.ADMIN) {
            const updateAdminProfile = {
               adminProfileId: existingUser.adminProfile.adminProfileId,
               firstName: existingUser.firstName,
               lastName: existingUser.lastName,
               birthday: existingUser.birthday,
               gender: existingUser.gender,
               phoneNumber: existingUser.phoneNumber,
               profilePhoto: existingUser.profilePhoto,
               role: existingUser.role,
               status: existingUser.adminProfile.status,
            }
            const token = jwt.sign(updateAdminProfile, this.JWT_SECRET_ADMIN, {
               expiresIn: this.JWT_EXPIRES_IN,
            })
            return { token, status: 'REGISTERED' }
         }
      } catch (error) {
         throw error
      }
   }
}
