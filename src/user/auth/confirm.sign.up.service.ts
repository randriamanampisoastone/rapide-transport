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
   private JWT_SECRET_CLIENT = ''
   private JWT_SECRET_DRIVER = ''
   private JWT_SECRET_ADMIN = ''

   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
      private readonly confiService: ConfigService,
   ) {
      this.JWT_SECRET_CLIENT =
         this.confiService.get<string>('JWT_SECRET_CLIENT')
      this.JWT_SECRET_DRIVER =
         this.confiService.get<string>('JWT_SECRET_DRIVER')
      this.JWT_SECRET_ADMIN = this.confiService.get<string>('JWT_SECRET_ADMIN')
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
            const ttl = await this.redisService.ttl(
               `${AUTH_SIGN_UP_PREFIX + confirmSignUpDto.phoneNumber}`,
            )
            const updateSignUpDto = {
               ...signUpDto,
               attempt: signUpDto.attempt + 1,
            }
            if (ttl > 0) {
               await this.redisService.set(
                  `${AUTH_SIGN_UP_PREFIX + confirmSignUpDto.phoneNumber}`,
                  JSON.stringify(updateSignUpDto),
                  ttl,
               )
            }
            throw new BadRequestException('Confirmation code is incorrect')
         }
         await this.redisService.remove(
            `${AUTH_SIGN_UP_PREFIX + confirmSignUpDto.phoneNumber}`,
         )

         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { confirmationCode, attempt, ...restSignUpDto } = signUpDto

         if (restSignUpDto.role === UserRole.CLIENT) {
            const clientProfile = await this.createClientProfile(restSignUpDto)
            await this.redisService.setClientToNew(clientProfile.sub)
            const token = jwt.sign(clientProfile, this.JWT_SECRET_CLIENT)
            console.log('token client :', token)
            return { token }
         } else if (restSignUpDto.role === UserRole.DRIVER) {
            const driverProfile = await this.createDriverProfile(restSignUpDto)
            const token = jwt.sign(driverProfile, this.JWT_SECRET_DRIVER)
            console.log('token driver :', token)
            return { token }
         } else if (restSignUpDto.role === UserRole.ADMIN) {
            const adminProfile = await this.createAdminProfile(restSignUpDto)
            const token = jwt.sign(adminProfile, this.JWT_SECRET_ADMIN)
            console.log('token driver :', token)
            return { token }
         }
      } catch (error) {
         throw error
      }
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
