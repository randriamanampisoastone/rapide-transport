import {
   BadRequestException,
   Injectable,
   NotFoundException,
   RequestTimeoutException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_UP_PREFIX } from 'constants/redis.constant'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from 'src/prisma/prisma.service'
import { SignUpDto } from './dto/sign.up.dto'
import { UserRole } from 'enums/profile.enum'
import { ConfirmDto } from './dto/confirm.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ConfirmSignUpService {
   private readonly JWT_SECRET_CLIENT = this.configService.get<string>('JWT_SECRET_CLIENT')
   private readonly JWT_SECRET_DRIVER = this.configService.get<string>('JWT_SECRET_DRIVER')
   private readonly JWT_SECRET_ADMIN = this.configService.get<string>('JWT_SECRET_ADMIN')
   private readonly JWT_SECRET_SELLER = this.configService.get<string>('JWT_SECRET_SELLER')
   private readonly JWT_EXPIRES_IN = this.configService.get<string>('JWT_EXPIRES_IN')

   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
      private readonly configService: ConfigService,
   ) {
   }

   async confirmSignUp(confirmSignUpDto: ConfirmDto) {
            try {
               const signUpDtoString = await this.redisService.get(
                  `${AUTH_SIGN_UP_PREFIX + confirmSignUpDto.phoneNumber}`,
               )

               if (!signUpDtoString) {
                  throw new NotFoundException('Timeout expired')
               }

               const signUpDto = JSON.parse(signUpDtoString)
               if (signUpDto.attempt >= 5) {
                  await this.redisService.remove(
                     `${AUTH_SIGN_UP_PREFIX + confirmSignUpDto.phoneNumber}`,
                  )
                  throw new RequestTimeoutException(
                     'You have reached the maximum number of attempts',
                  )
               }
               if (signUpDto.confirmationCode !== confirmSignUpDto.confirmationCode) {
                  await this.incrementAttempt(signUpDto, confirmSignUpDto.phoneNumber)
                  throw new BadRequestException('Confirmation code is incorrect')
               }
               await this.redisService.remove(
                  `${AUTH_SIGN_UP_PREFIX + confirmSignUpDto.phoneNumber}`,
               )

               const { confirmationCode, attempt, ...restSignUpDto } = signUpDto

               const token = await this.createProfileAndGenerateToken(restSignUpDto)
               return { token }
            } catch (error) {
               throw error
            }
         }

         private async incrementAttempt(signUpDto: any, phoneNumber: string) {
            const ttl = await this.redisService.ttl(
               `${AUTH_SIGN_UP_PREFIX + phoneNumber}`,
            )
            const updateSignUpDto = {
               ...signUpDto,
               attempt: signUpDto.attempt + 1,
            }
            if (ttl > 0) {
               await this.redisService.set(
                  `${AUTH_SIGN_UP_PREFIX + phoneNumber}`,
                  JSON.stringify(updateSignUpDto),
                  ttl,
               )
            }
         }

         private async createProfileAndGenerateToken(signUpDto: SignUpDto) {
            let profile, token
            switch (signUpDto.role) {
               case UserRole.CLIENT:
                  profile = await this.createClientProfile(signUpDto)
                  await this.redisService.setClientToNew(profile.sub)
                  token = this.generateToken(profile, this.JWT_SECRET_CLIENT)
                  break
               case UserRole.DRIVER:
                  profile = await this.createDriverProfile(signUpDto)
                  token = this.generateToken(profile, this.JWT_SECRET_DRIVER)
                  break
               case UserRole.ADMIN:
                  profile = await this.createAdminProfile(signUpDto)
                  token = this.generateToken(profile, this.JWT_SECRET_ADMIN)
                  break
               case UserRole.SELLER:
                  profile = await this.createAdminProfile(signUpDto)
                  token = this.generateToken(profile, this.JWT_SECRET_SELLER)
                  break
               default:
                  throw new BadRequestException('Invalid user role')
            }
            return token
         }

         private generateToken(profile: any, secret: string) {
            return jwt.sign(
               {
                  role: profile.role,
                  status: profile.status,
                  sub: profile.sub,
               },
               secret,
               {
                  expiresIn: this.JWT_EXPIRES_IN,
               },
            )
         }

   async createClientProfile(signUpDto: SignUpDto) {
      return await this.prismaService.$transaction(async (prisma) => {
         const authProfile = await this.prismaService.profile.create({
            data: {
               phoneNumber: signUpDto.phoneNumber,
               email: signUpDto.email,
               firstName: signUpDto.firstName,
               lastName: signUpDto.lastName,
               gender: signUpDto.gender,
               birthday: signUpDto.birthday,
               role: UserRole.CLIENT,
               profilePhoto: signUpDto.profilePhoto,
            },
         })

         const clientProfile = await prisma.clientProfile.create({
            data: {
               clientProfileId: authProfile.sub,
            },
         })
         await prisma.accountBalance.create({
            data: {
               clientProfileId: clientProfile.clientProfileId,
            },
         })

         return {
            sub: clientProfile.clientProfileId,
            role: authProfile.role,
            status: clientProfile.status,
         }
      })
   }
   async createDriverProfile(signUpDto: SignUpDto) {
      return await this.prismaService.$transaction(async (prisma) => {
         const authProfile = await this.prismaService.profile.create({
            data: {
               phoneNumber: signUpDto.phoneNumber,
               email: signUpDto.email,
               firstName: signUpDto.firstName,
               lastName: signUpDto.lastName,
               gender: signUpDto.gender,
               birthday: signUpDto.birthday,
               role: UserRole.DRIVER,
               profilePhoto: signUpDto.profilePhoto,
            },
         })

         const driverProfile = await prisma.driverProfile.create({
            data: {
               driverProfileId: authProfile.sub,
            },
         })
         await prisma.accountBalance.create({
            data: {
               driverProfileId: driverProfile.driverProfileId,
            },
         })

         return {
            sub: driverProfile.driverProfileId,
            role: authProfile.role,
            status: driverProfile.status,
         }
      })
   }
   async createAdminProfile(signUpDto: SignUpDto) {
      return await this.prismaService.$transaction(async (prisma) => {
         const authProfile = await this.prismaService.profile.create({
            data: {
               phoneNumber: signUpDto.phoneNumber,
               email: signUpDto.email,
               firstName: signUpDto.firstName,
               lastName: signUpDto.lastName,
               gender: signUpDto.gender,
               birthday: signUpDto.birthday,
               role: UserRole.ADMIN,
               profilePhoto: signUpDto.profilePhoto,
            },
         })

         const adminProfile = await prisma.adminProfile.create({
            data: {
               adminProfileId: authProfile.sub,
            },
         })

         return {
            sub: adminProfile.adminProfileId,
            role: authProfile.role,
            status: adminProfile.status,
         }
      })
   }
}
