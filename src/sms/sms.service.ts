import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import axios from 'axios'
import { SMS_TOKEN } from 'constants/redis.constant'

import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class SmsService {
   private SMS_ORANGE_CLIENT_ID: string
   private SMS_ORANGE_CLIENT_SECRET: string
   private CREDIENTIALS: string
   private SMS_SENDER_NUMBER: string
   private SMS_AUTH_URL: string
   private SMS_SEND_URL: string
   private SMS_GET_SOLDE_URL: string
   private SMS_PURCHASE_HISTORY_URL: string
   private SMS_TTL_TOKEN: number

   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService,
   ) {
      this.SMS_ORANGE_CLIENT_ID = this.configService.get<string>(
         'SMS_ORANGE_CLIENT_ID',
      )
      this.SMS_ORANGE_CLIENT_SECRET = this.configService.get<string>(
         'SMS_ORANGE_CLIENT_SECRET',
      )
      this.SMS_SENDER_NUMBER =
         this.configService.get<string>('SMS_SENDER_NUMBER')
      this.SMS_AUTH_URL = this.configService.get<string>('SMS_AUTH_URL')
      this.SMS_SEND_URL = this.configService.get<string>('SMS_SEND_URL')
      this.SMS_GET_SOLDE_URL =
         this.configService.get<string>('SMS_GET_SOLDE_URL')
      this.SMS_PURCHASE_HISTORY_URL = this.configService.get<string>(
         'SMS_PURCHASE_HISTORY_URL',
      )
      this.CREDIENTIALS = Buffer.from(
         `${this.SMS_ORANGE_CLIENT_ID}:${this.SMS_ORANGE_CLIENT_SECRET}`,
      ).toString('base64')
      this.SMS_TTL_TOKEN = this.configService.get<number>('SMS_TTL_TOKEN')
   }

   private getToken = async () => {
      const tokenCached = await this.redisService.get(SMS_TOKEN)

      if (!tokenCached) {
         const tokenResponse = await axios.post(
            this.SMS_AUTH_URL,
            'grant_type=client_credentials',
            {
               headers: {
                  Authorization: `Basic ${this.CREDIENTIALS}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
               },
            },
         )
         const token = tokenResponse.data.access_token

         this.redisService.set(SMS_TOKEN, token, this.SMS_TTL_TOKEN)
         return token
      } else {
         return tokenCached
      }
   }

   sendSMS = async (recipientNumbers: string[], message: string) => {
      const token = await this.getToken()

      await axios.post(
         this.SMS_SEND_URL,
         {
            outboundSMSMessageRequest: {
               address: recipientNumbers.map(
                  (recipientNumber) => `tel:${recipientNumber}`,
               ),
               senderAddress: `tel:${this.SMS_SENDER_NUMBER}`,
               senderName: 'RAPIDE APP',
               outboundSMSTextMessage: {
                  message: String(message),
               },
            },
         },
         {
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         },
      )
   }
}
