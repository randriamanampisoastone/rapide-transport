import { Injectable } from '@nestjs/common'
import { Gateway } from 'src/gateway/gateway'

@Injectable()
export class TestService {
   constructor(private readonly getway: Gateway) {}

   async testBeforDriverWork() {
      await this.getway.sendNotificationToAdmin('cancelledRide', 'test')
   }
}
