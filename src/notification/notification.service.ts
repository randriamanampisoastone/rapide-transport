import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosError } from 'axios'
import { UserRole } from 'enums/profile.enum'
import { NotificationInterface } from 'interfaces/notification.interface'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class NotificationService {
   private readonly logger = new Logger(NotificationService.name)
   private EXPO_PUSH_URL = ''

   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService,
   ) {
      this.EXPO_PUSH_URL = this.configService.get('EXPO_PUSH_URL')
   }

   async sendPushNotification(
      expoPushToken: string,
      title: string,
      body: string,
      icon?: string,
   ): Promise<any> {
      if (!expoPushToken.startsWith('ExponentPushToken')) {
         throw new BadRequestException('InvalidExpoPushToken')
      }

      const payload = {
         to: expoPushToken,
         sound: 'default',
         title,
         body,
         android: {
            icon,
         },
         ios: {
            image: 'https://picsum.photos/200/300',
         },
      }

      try {
         const { data } = await axios.post(this.EXPO_PUSH_URL, payload, {
            headers: {
               'Content-Type': 'application/json',
            },
         })

         return data
      } catch (error) {
         if (error instanceof AxiosError) {
            this.logger.error(
               `Error sending notification: ${JSON.stringify(error.response?.data)}`,
            )
         } else {
            this.logger.error(`Unexpected error: ${error.message}`)
         }

         throw new Error('Failed to send push notification')
      }
   }

   async registerExpoPushToken(data: NotificationInterface) {
      const userProfileId = data.userProfileId
      const expoPushToken = data.expoPushToken
      const role = data.role

      console.log('userProfileId : ', userProfileId)
      console.log('expoPushToken : ', expoPushToken)
      console.log('role : ', role)

      if (userProfileId && expoPushToken && role) {
         if (role === UserRole.CLIENT) {
            this.redisService.setClientExpoPushToken(
               userProfileId,
               expoPushToken,
            )
         } else if (role === UserRole.DRIVER) {
            this.redisService.setDriverExpoPushToken(
               userProfileId,
               expoPushToken,
            )
         }
      }
   }
}
