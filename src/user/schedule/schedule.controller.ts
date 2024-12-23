import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import { Controller, Body, Get, Query, Patch } from '@nestjs/common'

import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ScheduleService } from './schedule.service'

@Controller('schedule')
export class ScheduleController {
   constructor(private readonly scheduleService: ScheduleService) {}

   @Get('findSchedule')
   @Authorization({ allowedGroups: ['ProviderGroup'] })
   async findSchedule(@CognitoUser('sub') providerProfileId: string) {
      return await this.scheduleService.findSchedule(providerProfileId)
   }

   @Patch('update')
   @Authorization({ allowedGroups: ['ProviderGroup'] })
   async updateSchedule(
      @CognitoUser('sub') providerProfileId: string,
      @Query('scheduleId') scheduleId: string,
      @Body() udateScheduleDto: UpdateScheduleDto,
   ) {
      return await this.scheduleService.updateSchedule(
         providerProfileId,
         scheduleId,
         udateScheduleDto,
      )
   }
}
