import { Controller, Get, Query } from '@nestjs/common'
import { VehicleService } from './vehicle.service'

@Controller('vehicle')
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
