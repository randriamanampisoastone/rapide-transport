import {
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'

import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { Schedule } from '@prisma/client'

@Injectable()
export class ScheduleService {
   constructor(private readonly prismaService: PrismaService) {}

   async findSchedule(providerProfileId: string) {
      try {
         return await this.prismaService.schedule.findUnique({
            where: {
               providerProfileId,
            },
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   private async checkOwnership(
      providerProfileId: string,
      scheduleId: string,
   ): Promise<Omit<Schedule, 'providerProfile'>> {
      if (!scheduleId) {
         throw new ForbiddenException('Invalid input parameters')
      }

      const schedule = await this.prismaService.schedule.findUnique({
         where: { scheduleId },
      })

      if (!schedule) {
         throw new NotFoundException('Schedule not found')
      }

      if (schedule.providerProfileId !== providerProfileId) {
         throw new ForbiddenException(
            'You are not authorized to update or delete this Schedule',
         )
      }
      return schedule
   }
   async updateSchedule(
      providerProfileId: string,
      scheduleId: string,
      updateScheduleDto: UpdateScheduleDto,
   ) {
      try {
         await this.checkOwnership(providerProfileId, scheduleId)
         return await this.prismaService.schedule.update({
            where: { scheduleId },
            data: updateScheduleDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
