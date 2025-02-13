import { Module } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { TaskPlanService } from './task.plan.service'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
   imports: [ScheduleModule.forRoot()],
   controllers: [],
   providers: [RedisService, TaskPlanService],
})
export class TaskPlanModule {}
