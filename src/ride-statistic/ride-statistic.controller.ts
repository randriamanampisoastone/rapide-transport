import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common'
import { RideStatisticService } from './ride-statistic.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { RolesGuard } from 'src/jwt/roles.guard'

@Controller('ride-statistic')
export class RideStatisticController {
   constructor(private readonly rideStatisticService: RideStatisticService) {}

   @Get('get-driver-statistic')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   async getDriverStatistic(@GetUser('sub') driverProfileId: string) {
      return await this.rideStatisticService.getDriverStatistic(driverProfileId)
   }

   @Get('get-global-statistic')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getGlobalRideStatistic() {
      return await this.rideStatisticService.geGlobalRideStatistic()
   }
}
