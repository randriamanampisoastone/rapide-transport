import { Controller, Get, Query } from '@nestjs/common'
import { VehicleService } from './vehicle.service'
import { ROUTE_VEHICLE } from 'routes/main-routes'

@Controller(ROUTE_VEHICLE)
export class VehicleController {
   constructor(private readonly vehicleService: VehicleService) {}

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
