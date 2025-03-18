import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { RedisService } from 'src/redis/redis.service'

@Module({
   providers: [NotificationService, RedisService],
})
export class NotificationModule {}
