import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { CreateItineraryService } from './create-itinerary.service'
import { CreateItineraryDto, CreateRideDto } from './dto/create-ride.dto'
import { CreateRideService } from './create-ride.service'
import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import { AcceptDriverDto, AcceptRideService } from './accept-driver.service'

@Controller('ride')
export class RideController {
   constructor(
      private readonly createItineraryService: CreateItineraryService,
      private readonly createRideService: CreateRideService,
      private readonly acceptRideService: AcceptRideService,
   ) {}

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('create-itinerary')
   createItinerary(
      @Body() createItineraryDto: CreateItineraryDto,
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.createItineraryService.createItinerary(
         createItineraryDto,
         clientProfileId,
      )
   }

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('create-ride')
   createRide(
      @Body() createRideDto: CreateRideDto,
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.createRideService.createRide(createRideDto, clientProfileId)
   }

   @Get('find-ride-by-id')
   findRide(@Query('rideId') rideId: string) {
      return this.createRideService.findRide(rideId)
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('accept-ride')
   acceptRide(@Body() acceptDriverDto: AcceptDriverDto) {
      return this.acceptRideService.acceptDriver(acceptDriverDto)
   }
}
