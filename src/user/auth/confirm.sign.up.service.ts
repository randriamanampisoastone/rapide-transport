import {BadRequestException, Injectable, NotFoundException, RequestTimeoutException,} from '@nestjs/common'
import {RedisService} from 'src/redis/redis.service'
import {AUTH_SIGN_UP_PREFIX} from 'constants/redis.constant'
import * as jwt from 'jsonwebtoken'
import {PrismaService} from 'src/prisma/prisma.service'
import {SignUpDto} from './dto/sign.up.dto'
import {UserRole} from 'enums/profile.enum'
import {ConfirmDto} from './dto/confirm.dto'
import {ConfigService} from '@nestjs/config'

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
                  profile = await this.createProfile(signUpDto, UserRole.CLIENT)
                  await this.redisService.setClientToNew(profile.sub)
                  token = this.generateToken(profile, this.JWT_SECRET_CLIENT)
                  break
               case UserRole.DRIVER:
                  profile = await this.createProfile(signUpDto, UserRole.DRIVER)
                  token = this.generateToken(profile, this.JWT_SECRET_DRIVER)
                  break
               case UserRole.ADMIN:
                  profile = await this.createProfile(signUpDto, UserRole.ADMIN)
                  token = this.generateToken(profile, this.JWT_SECRET_ADMIN)
                  break
               case UserRole.SELLER:
                  profile = await this.createProfile(signUpDto, UserRole.SELLER)
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
                  status: profile.status ?? 'ACTIVE',
                  sub: profile.sub,
               },
               secret,
               {
                  expiresIn: this.JWT_EXPIRES_IN,
               },
            )
         }

   private async createProfile(signUpDto: SignUpDto, role: UserRole) {
      return this.prismaService.$transaction(async (prisma) => {
         const authProfile = await prisma.profile.create({
            data: {
               phoneNumber: signUpDto.phoneNumber,
               email: signUpDto.email,
               firstName: signUpDto.firstName,
               lastName: signUpDto.lastName,
               gender: signUpDto.gender,
               birthday: signUpDto.birthday,
               role: role,
               profilePhoto: signUpDto.profilePhoto,
            },
         })

         if(role === UserRole.SELLER){
            return authProfile;
         }

         let profileData;
         switch (role) {
            case UserRole.CLIENT:
               const clientProfile = await prisma.clientProfile.create({
                  data: {clientProfileId: authProfile.sub},
               })
               await prisma.accountBalance.create({
                  data: {clientProfileId: clientProfile.clientProfileId},
               })
               profileData = clientProfile;
               break;

            case UserRole.DRIVER:
               const driverProfile = await prisma.driverProfile.create({
                  data: {driverProfileId: authProfile.sub},
               })
               await prisma.accountBalance.create({
                  data: {driverProfileId: driverProfile.driverProfileId},
               })
               profileData = driverProfile;
               break;

            case UserRole.ADMIN:
               const adminProfile = await prisma.adminProfile.create({
                  data: {adminProfileId: authProfile.sub},
               })
               profileData = adminProfile;
               break;

         }

         return {
            sub: profileData[`${role.toLowerCase()}ProfileId`],
            role: authProfile.role,
            status: profileData.status,
         }
      });
   }
}
