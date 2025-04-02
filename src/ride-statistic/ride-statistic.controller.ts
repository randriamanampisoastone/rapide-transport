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
import { ProfileStatus, UserRole } from '@prisma/client'
import { ROUTE_STATISTIC_RIDE } from 'routes/main-routes'
import {
   ROUTE_GET_DRIVER_STATISTIC,
   ROUTE_GET_GLOBAL_STATISTIC,
} from 'routes/secondary-routes'

@Controller(ROUTE_STATISTIC_RIDE)
export class RideStatisticController {
   constructor(private readonly rideStatisticService: RideStatisticService) {}

   @Get(ROUTE_GET_DRIVER_STATISTIC)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
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

   @Get(ROUTE_GET_GLOBAL_STATISTIC)
   @SetMetadata('allowedRole', [
      UserRole.SUPER_ADMIN,
      UserRole.RIDER,
      UserRole.MANAGER_HUB,
   ])
   @UseGuards(RolesGuard)
   async getGlobalRideStatistic() {
      return await this.rideStatisticService.geGlobalRideStatistic()
   }
}
