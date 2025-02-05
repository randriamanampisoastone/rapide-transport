import { PrismaService } from 'src/prisma/prisma.service'
import { OAuth2Client } from 'google-auth-library'
import { UserRole } from 'enums/profile.enum'
import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'

@Injectable()
export class GoogleAuthService {
   private WEB_CLIENT_ID =
      '378200763630-4tevtt89ff6g7alvigl1r041ditle8j5.apps.googleusercontent.com'
   private client = new OAuth2Client(this.WEB_CLIENT_ID)

   constructor(
      private readonly jwtService: JwtService,
      private readonly prismaService: PrismaService,
   ) {}

   async verifyGoogleToken(idToken: string) {
      try {
         const ticket = await this.client.verifyIdToken({
            idToken,
            audience: this.WEB_CLIENT_ID,
         })
         const payload = ticket.getPayload()
         return payload
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
            const token = await this.jwtService.signAsync(updateClientProfile)
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
            const token = await this.jwtService.signAsync(updateDriverProfile)
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
            const token = await this.jwtService.signAsync(updateAdminProfile)
            return { token, status: 'REGISTERED' }
         }
      } catch (error) {
         throw error
      }
   }
}
