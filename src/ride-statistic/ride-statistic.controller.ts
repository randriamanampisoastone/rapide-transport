import {
   Controller,
   ForbiddenException,
   Get,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { RideStatisticService } from './ride-statistic.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { RolesGuard } from 'src/jwt/roles.guard'
import { ProfileStatus } from '@prisma/client'

@Controller('ride-statistic')
export class RideStatisticController {
   constructor(private readonly rideStatisticService: RideStatisticService) {}

   @Get('get-driver-statistic')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   async getDriverStatistic(
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.rideStatisticService.getDriverStatistic(driverProfileId)
   }

   @Get('get-global-statistic')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async getGlobalRideStatistic() {
      return await this.rideStatisticService.geGlobalRideStatistic()
   }
}
