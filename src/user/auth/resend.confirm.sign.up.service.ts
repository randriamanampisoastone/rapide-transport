import {
   Injectable,
   NotFoundException,
   RequestTimeoutException,
} from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AUTH_SIGN_UP_PREFIX } from 'constants/redis.constant'
import { SmsService } from 'src/sms/sms.service'
import { ResendConfirmDto } from './dto/resend.confirm.dto'
import * as speakeasy from 'speakeasy'

@Injectable()
export class ResendConfirmSignUpService {
   constructor(
      private readonly redisService: RedisService,
      private readonly smsService: SmsService,
   ) {}

   async resendConfirmSignUp(resendConfirmDto: ResendConfirmDto) {
      try {
         const signUpDtoString = await this.redisService.get(
            `${AUTH_SIGN_UP_PREFIX + resendConfirmDto.phoneNumber}`,
         )

         if (!signUpDtoString) {
            throw new NotFoundException('Timeout expired')
         }

         const signUpDto = JSON.parse(signUpDtoString)

         if (signUpDto.attempt >= 5) {
            await this.redisService.remove(
               `${AUTH_SIGN_UP_PREFIX + resendConfirmDto.phoneNumber}`,
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
            `${AUTH_SIGN_UP_PREFIX + resendConfirmDto.phoneNumber}`,
         )

         const updateSignUpDto = {
            ...signUpDto,
            attempt: signUpDto.attempt + 1,
         }
         if (ttl > 0) {
            await this.redisService.set(
               `${AUTH_SIGN_UP_PREFIX + resendConfirmDto.phoneNumber}`,
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
