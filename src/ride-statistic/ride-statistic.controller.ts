import { Controller, Get, Query } from '@nestjs/common'
import { RideStatisticService } from './ride-statistic.service'

@Controller('ride-statistic')
export class RideStatisticController {
   constructor(private readonly rideStatisticService: RideStatisticService) {}

   @Get('get-driver-statistic')
   async getDriverStatistic(@Query('sub') driverProfileId: string) {
      return await this.rideStatisticService.getDriverStatistic(driverProfileId)
   }
}
