import {
   Injectable,
   NotFoundException,
   RequestTimeoutException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_IN_PREFIX } from 'constants/redis.constant'
import { SmsService } from 'src/sms/sms.service'
import { ResendConfirmDto } from './dto/resend.confirm.dto'
import * as speakeasy from 'speakeasy'

@Injectable()
export class ResendConfirmSignInService {
   constructor(
      private readonly redisService: RedisService,
      private readonly smsService: SmsService,
   ) {}

   async resendConfirmSignIn(resendConfirmDto: ResendConfirmDto) {
      try {
         const signInDtoString = await this.redisService.get(
            `${AUTH_SIGN_IN_PREFIX + resendConfirmDto.phoneNumber}`,
         )

         if (!signInDtoString) {
            throw new NotFoundException('Timeout expired')
         }

         const signInDto = JSON.parse(signInDtoString)

         if (signInDto.attempt >= 5) {
            await this.redisService.remove(
               `${AUTH_SIGN_IN_PREFIX + resendConfirmDto.phoneNumber}`,
            )
            throw new RequestTimeoutException(
               'You have reached the maximum number of attempts',
            )
         }
         const secret = speakeasy.generateSecret({ length: 20 })
         const confirmationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
         })
         await this.smsService.sendSMS(
            [resendConfirmDto.phoneNumber],
            `Your Rapide App confirmation code is : ${confirmationCode}`,
         )
         const ttl = await this.redisService.ttl(
            `${AUTH_SIGN_IN_PREFIX + resendConfirmDto.phoneNumber}`,
         )
         const updateSignUpDto = {
            ...signInDto,
            attempt: signInDto.attempt + 1,
            confirmationCode,
         }
         if (ttl > 0) {
            await this.redisService.set(
               `${AUTH_SIGN_IN_PREFIX + resendConfirmDto.phoneNumber}`,
               JSON.stringify(updateSignUpDto),
               ttl,
            )
         }
      } catch (error) {
         console.error(error)
         throw error
      }
   }
}
