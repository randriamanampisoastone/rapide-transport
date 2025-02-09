import { Injectable } from '@nestjs/common'
import { EVENT_CANCELLED_RIDE } from 'constants/event.constant'
import { Gateway } from 'src/gateway/gateway'

@Injectable()
export class TestService {
   constructor(private readonly getway: Gateway) {}

   async testBeforDriverWork() {
      await this.getway.sendNotificationToAdmin(EVENT_CANCELLED_RIDE, 'test')
   }
}
