import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosError } from 'axios'

@Injectable()
export class NotificationService {
   private readonly logger = new Logger(NotificationService.name)
   private EXPO_PUSH_URL = ''

   constructor(private readonly configService: ConfigService) {
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
}
