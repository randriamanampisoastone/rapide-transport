import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common'
import { HistoricalService } from './historical.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { RideStatus } from 'enums/ride.enum'

@Controller('historical')
export class HistoricalController {
   constructor(private readonly historicalService: HistoricalService) {}

   @Get('getAllHistorical')
   // @SetMetadata('allowedRole', ['ADMIN'])
   // @UseGuards(RolesGuard)
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

   @Get('getClientHistorical')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async getClientHistorical(
      @GetUser('sub') clientProfileId: string,
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

   @Get('getClientHistoricalByAdmin')
   @SetMetadata('allowedRole', ['ADMIN'])
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

   @Get('getDriverHistorical')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   async getDriverHistorical(
      @GetUser('sub') driverProfileId: string,
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

   @Get('getDriverHistoricalByAdmin')
   @SetMetadata('allowedRole', ['ADMIN'])
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
