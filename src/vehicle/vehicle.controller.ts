import { Controller, Get, Query } from '@nestjs/common'
import { VehicleService } from './vehicle.service'
import { Authorization } from '@nestjs-cognito/auth'

@Controller('vehicle')
export class VehicleController {
   constructor(private readonly vehicleService: VehicleService) {}

   @Authorization({ allowedGroups: ['ClientGroup', 'DriverGroup'] })
   @Get('finding-drivers-near-by')
   findingDriversNearBy(
      @Query('latitude') latitude: string,
      @Query('longitude') longitude: string,
   ) {
      return this.vehicleService.findingDriversNearBy({
         latitude: Number(latitude),
         longitude: Number(longitude),
      })
   }
}
