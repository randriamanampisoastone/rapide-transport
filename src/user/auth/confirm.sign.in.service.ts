import {
   BadRequestException,
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
      private readonly redisService: RedisService,
      private readonly jwtService: JwtService,
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
               include: {
                  clientProfile: true,
               },
            })
            const updateClientProfile = {
               clientProfileId: clientProfile.clientProfile.clientProfileId,
               firstName: clientProfile.firstName,
               lastName: clientProfile.lastName,
               birthday: clientProfile.birthday,
               gender: clientProfile.gender,
               phoneNumber: clientProfile.phoneNumber,
               profilePhoto: clientProfile.profilePhoto,
               role: clientProfile.role,
               status: clientProfile.clientProfile.status,
            }
            const token = await this.jwtService.signAsync(updateClientProfile)
            return { token }
         } else if (restSignInDto.role === UserRole.DRIVER) {
            const driverProfile = await this.prismaService.profile.findUnique({
               where: { phoneNumber: signInDto.phoneNumber },
               include: {
                  driverProfile: true,
               },
            })
            const updateDriverProfile = {
               clientProfileId: driverProfile.driverProfile.driverProfileId,
               firstName: driverProfile.firstName,
               lastName: driverProfile.lastName,
               birthday: driverProfile.birthday,
               gender: driverProfile.gender,
               phoneNumber: driverProfile.phoneNumber,
               profilePhoto: driverProfile.profilePhoto,
               role: driverProfile.role,
               status: driverProfile.driverProfile.status,
            }
            const token = await this.jwtService.signAsync(updateDriverProfile)
            return { token }
         } else if (restSignInDto.role === UserRole.ADMIN) {
            const adminProfile = await this.prismaService.profile.findUnique({
               where: { phoneNumber: signInDto.phoneNumber },
               include: {
                  adminProfile: true,
               },
            })
            const updateAdminProfile = {
               clientProfileId: adminProfile.adminProfile.adminProfileId,
               firstName: adminProfile.firstName,
               lastName: adminProfile.lastName,
               birthday: adminProfile.birthday,
               gender: adminProfile.gender,
               phoneNumber: adminProfile.phoneNumber,
               profilePhoto: adminProfile.profilePhoto,
               role: adminProfile.role,
               status: adminProfile.adminProfile.status,
            }
            const token = await this.jwtService.signAsync(updateAdminProfile)
            return { token }
         }
      } catch (error) {
         console.error(error)
         throw error
      }
   }
}
