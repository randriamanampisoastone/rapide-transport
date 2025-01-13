import { Body, Controller, Get, Post } from '@nestjs/common'
import { LocationService } from './location.service'
import { LatLng } from 'interfaces/itinerary';

@Controller('location')
export class LocationController {
   constructor(private location: LocationService) {}

   @Post()
   async addDriverLocation(
      @Body() body: { latitude: number; longitude: number; driverId: string },
   ) {
    console.log(body)
    const latLng: LatLng = { latitude: body.latitude, longitude: body.longitude }
      return await this.location.addDriverLocation(
         latLng,
         body.driverId,
      )
   }

   @Get()
   async getDriversNearby(@Body() body: {latitude: number; longitude: number}) {
      return await this.location.getDriversNearby(body) 
   }
}
