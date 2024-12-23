import { Controller, Post, Body } from '@nestjs/common'
import { CreateItineraryService } from './create-itinerary.service'
import { CreateItineraryDto, CreateRideDto } from './dto/create-ride.dto'
import { CreateRideService } from './create-ride.service'

@Controller('ride')
export class CreateRideController {
   constructor(
      private readonly createItineraryService: CreateItineraryService,
      private readonly createRideService: CreateRideService,
   ) {}

   @Post('create-itinerary')
   createItinerary(@Body() createItineraryDto: CreateItineraryDto) {
      return this.createItineraryService.createItinerary(createItineraryDto)
   }

   @Post('create-ride')
   createRide(@Body() createRideDto: CreateRideDto) {
      return this.createRideService.createRide(createRideDto)
   }
}
