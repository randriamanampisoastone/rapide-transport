import {
   Controller,
   ForbiddenException,
   Get,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { HistoricalService } from './historical.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { RideStatus } from 'enums/ride.enum'
import { ProfileStatus, UserRole } from '@prisma/client'
import { ROUTE_HISTORICAL } from 'routes/main-routes'
import {
   ROUTE_GET_ALL_HISTORICAL,
   ROUTE_GET_CLIENT_HISTORICAL,
   ROUTE_GET_CLIENT_HISTORICAL_BY_ADMIN,
   ROUTE_GET_DRIVER_HISTORICAL,
   ROUTE_GET_DRIVER_HISTORICAL_BY_ADMIN,
} from 'routes/secondary-routes'

@Controller(ROUTE_HISTORICAL)
export class HistoricalController {
   constructor(private readonly historicalService: HistoricalService) {}

   @Get(ROUTE_GET_ALL_HISTORICAL)
   @SetMetadata('allowedRole', [
      UserRole.CALL_CENTER,
      UserRole.SUPER_ADMIN,
      UserRole.RIDER,
      UserRole.MANAGER_HUB,
   ])
   @UseGuards(RolesGuard)
   async getAllHistorical(
      @Query('status') status: RideStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.historicalService.getAllHistorical(
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_CLIENT_HISTORICAL)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async getClientHistorical(
      @GetUser('sub') clientProfileId: string,
      @Query('status') status: RideStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') profileStatus: ProfileStatus,
   ) {
      if (profileStatus !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.historicalService.getClientHistorical(
         clientProfileId,
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_CLIENT_HISTORICAL_BY_ADMIN)
   @SetMetadata('allowedRole', [
      UserRole.CALL_CENTER,
      UserRole.SUPER_ADMIN,
      UserRole.RIDER,
      UserRole.MANAGER_HUB,
   ])
   @UseGuards(RolesGuard)
   async getClientHistoricalByAdmin(
      @Query('clientProfileId') clientProfileId: string,
      @Query('status') status: RideStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.historicalService.getClientHistorical(
         clientProfileId,
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_DRIVER_HISTORICAL)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   async getDriverHistorical(
      @GetUser('sub') driverProfileId: string,
      @Query('status') status: RideStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') profileStatus: ProfileStatus,
   ) {
      if (profileStatus !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.historicalService.getDriverHistorical(
         driverProfileId,
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_DRIVER_HISTORICAL_BY_ADMIN)
   @SetMetadata('allowedRole', [
      UserRole.CALL_CENTER,
      UserRole.SUPER_ADMIN,
      UserRole.RIDER,
      UserRole.MANAGER_HUB,
   ])
   @UseGuards(RolesGuard)
   async getDriverHistoricalByAdmin(
      @Query('driverProfileId') driverProfileId: string,
      @Query('status') status: RideStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.historicalService.getDriverHistorical(
         driverProfileId,
         status,
         page || 1,
         pageSize || 10,
      )
   }
}
