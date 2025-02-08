import {
   BadRequestException,
   Inject,
   Injectable,
   NotFoundException,
   RequestTimeoutException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_IN_PREFIX } from 'constants/redis.constant'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserRole } from 'enums/profile.enum'
import { ConfirmDto } from './dto/confirm.dto'

@Injectable()
export class ConfirmSignInService {
   constructor(
      @Inject('jwtClient') private readonly jwtClientService: JwtService,
      @Inject('jwtDriver') private readonly jwtDriverService: JwtService,
      @Inject('jwtAdmin') private readonly jwtAdminService: JwtService,
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}

   async confirmSignIn(confirmSignInDto: ConfirmDto) {
      try {
         console.log(`${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`)

         const signInDtoString = await this.redisService.get(
            `${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`,
         )

         if (!signInDtoString) {
            throw new NotFoundException('Timeout expired')
         }

         const signInDto = JSON.parse(signInDtoString)

         if (signInDto.attempt >= 5) {
            await this.redisService.remove(
               `${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`,
            )
            throw new RequestTimeoutException(
               'You have reached the maximum number of attempts',
            )
         }
         if (signInDto.confirmationCode !== confirmSignInDto.confirmationCode) {
            const ttl = await this.redisService.ttl(
               `${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`,
            )
            const updateSignUpDto = {
               ...signInDto,
               attempt: signInDto.attempt + 1,
            }
            if (ttl > 0) {
               await this.redisService.set(
                  `${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`,
                  JSON.stringify(updateSignUpDto),
                  ttl,
               )
            }
            throw new BadRequestException('Confirmation code is incorrect')
         }

         await this.redisService.remove(
            `${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`,
         )

         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { confirmationCode, attempt, ...restSignInDto } = signInDto

         if (restSignInDto.role === UserRole.CLIENT) {
            const clientProfile = await this.prismaService.profile.findUnique({
               where: { phoneNumber: signInDto.phoneNumber },
               select: {
                  sub: true,
                  role: true,
                  clientProfile: {
                     select: {
                        status: true,
                     },
                  },
               },
            })
            const updateClientProfile = {
               sub: clientProfile.sub,
               role: clientProfile.role,
               status: clientProfile.clientProfile.status,
            }
            const token =
               await this.jwtClientService.signAsync(updateClientProfile)
            return { token }
         } else if (restSignInDto.role === UserRole.DRIVER) {
            const driverProfile = await this.prismaService.profile.findUnique({
               where: { phoneNumber: signInDto.phoneNumber },
               select: {
                  sub: true,
                  role: true,
                  driverProfile: {
                     select: {
                        status: true,
                     },
                  },
               },
            })
            const updateDriverProfile = {
               sub: driverProfile.sub,
               role: driverProfile.role,
               status: driverProfile.driverProfile.status,
            }
            const token =
               await this.jwtDriverService.signAsync(updateDriverProfile)
            return { token }
         } else if (restSignInDto.role === UserRole.ADMIN) {
            const adminProfile = await this.prismaService.profile.findUnique({
               where: { phoneNumber: signInDto.phoneNumber },
               select: {
                  sub: true,
                  role: true,
                  adminProfile: {
                     select: {
                        status: true,
                     },
                  },
               },
            })
            const updateAdminProfile = {
               sub: adminProfile.sub,
               role: adminProfile.role,
               status: adminProfile.adminProfile.status,
            }
            const token =
               await this.jwtAdminService.signAsync(updateAdminProfile)
            return { token }
         }
      } catch (error) {
         console.error(error)
         throw error
      }
   }
}
