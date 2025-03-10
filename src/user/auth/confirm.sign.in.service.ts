import {
   BadRequestException,
   Injectable,
   NotFoundException,
   RequestTimeoutException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_IN_PREFIX } from 'constants/redis.constant'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserRole } from 'enums/profile.enum'
import { ConfirmDto } from './dto/confirm.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ConfirmSignInService {
   private readonly JWT_SECRET_CLIENT = this.configService.get<string>('JWT_SECRET_CLIENT')
   private readonly JWT_SECRET_DRIVER = this.configService.get<string>('JWT_SECRET_DRIVER')
   private readonly JWT_SECRET_ADMIN = this.configService.get<string>('JWT_SECRET_ADMIN')
   private readonly JWT_SECRET_SELLER = this.configService.get<string>('JWT_SECRET_SELLER')
   private readonly JWT_EXPIRES_IN = this.configService.get<string>('JWT_EXPIRES_IN')

   constructor(
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
      private readonly configService: ConfigService
   ) {
   }

   async confirmSignIn(confirmSignInDto: ConfirmDto) {
      try {
         const redisKey = `${AUTH_SIGN_IN_PREFIX + confirmSignInDto.phoneNumber}`
         const signInDtoString = await this.redisService.get(redisKey)

         if (!signInDtoString) {
            throw new NotFoundException('Timeout expired')
         }

         const signInDto = JSON.parse(signInDtoString)

         await this.validateConfirmationAttempts(signInDto, confirmSignInDto, redisKey)
         await this.redisService.remove(redisKey)

         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { confirmationCode, attempt, ...restSignInDto } = signInDto

         return await this.generateToken(restSignInDto, signInDto.phoneNumber)
      } catch (error) {
         console.error(error)
         throw error
      }
   }

   private async validateConfirmationAttempts(signInDto: any, confirmSignInDto: ConfirmDto, redisKey: string) {
      if (signInDto.attempt >= 5) {
         await this.redisService.remove(redisKey)
         throw new RequestTimeoutException('You have reached the maximum number of attempts')
      }

      if (signInDto.confirmationCode !== confirmSignInDto.confirmationCode) {
         const ttl = await this.redisService.ttl(redisKey)
         if (ttl > 0) {
            await this.redisService.set(
               redisKey,
               JSON.stringify({ ...signInDto, attempt: signInDto.attempt + 1 }),
               ttl
            )
         }
         throw new BadRequestException('Confirmation code is incorrect')
      }
   }

   private async generateToken(restSignInDto: any, phoneNumber: string) {
      const profileData = {
         where: { phoneNumber },
         select: {
            sub: true,
            role: true,
            clientProfile: { select: { status: true } },
            driverProfile: { select: { status: true } },
            adminProfile: { select: { status: true } }
         }
      }

      const profile = await this.prismaService.profile.findUnique(profileData)

      const profileMap = {
         [UserRole.CLIENT]: { secret: this.JWT_SECRET_CLIENT, profile: profile.clientProfile },
         [UserRole.DRIVER]: { secret: this.JWT_SECRET_DRIVER, profile: profile.driverProfile },
         [UserRole.ADMIN]: { secret: this.JWT_SECRET_ADMIN, profile: profile.adminProfile }
      }

      const roleConfig = profileMap[restSignInDto.role]
      if (!roleConfig) {
         throw new BadRequestException('Invalid user role')
      }

      const updateProfile = {
         sub: profile.sub,
         role: profile.role,
         status: roleConfig.profile.status
      }

      const token = jwt.sign(updateProfile, roleConfig.secret, {
         expiresIn: this.JWT_EXPIRES_IN
      })

      return { token }
   }
}
