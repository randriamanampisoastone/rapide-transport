import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { CreateItineraryService } from './create-itinerary.service'
import { CreateRideService } from './create-ride.service'
import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import { DriverArrivedService } from './driver-arrived.service'

import { GetRideService } from './get-ride.service'
import { CancelledService } from './cancelled.service'
import { DriverAcceptService } from './driver-accept.service'
import { DriverOnTheWayService } from './driver-on-the-way.service'
import { ClientNotFoundService } from './client-not-found.service'
import { StartService } from './start.service'
import { ClientGiveUpService } from './client-give-up.service'
import { ArrivedDestinationService } from './arrived-destination.service'
import { CompleteService } from './complete.service'
import { ReviewService } from './review.service'
import { LatLng } from 'interfaces/location.interface'
import { VehicleType } from 'enums/vehicle.enum'
import { PaymentMethodType } from 'enums/payment.enum'
import { StoppedService } from './stopped.service'

@Controller('ride')
export class RideController {
   constructor(
      private readonly createItineraryService: CreateItineraryService,
      private readonly createRideService: CreateRideService,
      private readonly cancelledService: CancelledService,
      private readonly driverAcceptService: DriverAcceptService,
      private readonly driverOnTheWayService: DriverOnTheWayService,
      private readonly stoppedService: StoppedService,
      private readonly driverArrivedService: DriverArrivedService,
      private readonly clientNotFoundService: ClientNotFoundService,
      private readonly startService: StartService,
      private readonly clientGiveUpService: ClientGiveUpService,
      private readonly arrivedDestinationService: ArrivedDestinationService,
      private readonly completeService: CompleteService,
      private readonly reviewService: ReviewService,

      private readonly getRideService: GetRideService,
   ) {}

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('create-itinerary')
   createItinerary(
      @Body()
      data: { pickUpLocation: LatLng; dropOffLocation: LatLng },
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.createItineraryService.createItinerary({
         ...data,
         clientProfileId,
      })
   }

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('create-ride')
   createRide(
      @Body()
      data: {
         pickUpLocation: LatLng
         dropOffLocation: LatLng
         vehicleType: VehicleType
         paymentMethodType: PaymentMethodType
      },
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.createRideService.createRide({
         ...data,
         clientProfileId,
      })
   }

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('cancelled')
   cancelled(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.cancelledService.cancelled({ rideId, clientProfileId })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('driver-accept')
   driverAccept(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') driverProfileId,
   ) {
      return this.driverAcceptService.driverAccept({ driverProfileId, rideId })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('driver-on-the-way')
   driverOnTheWay(
      @Body() data: { rideId: string; driverLocation: LatLng },
      @CognitoUser('sub') driverProfileId,
   ) {
      return this.driverOnTheWayService.driverOnTheWay({
         driverProfileId,
         ...data,
      })
   }

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('stopped')
   stopped(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.stoppedService.clientStopped({ rideId, clientProfileId })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('driver-arrived')
   drivertArrived(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') driverProfileId,
   ) {
      console.log('driver arrived')

      return this.driverArrivedService.drivertArrived({
         driverProfileId,
         rideId,
      })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('client-not-found')
   clientNotFound(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') driverProfileId,
   ) {
      return this.clientNotFoundService.clientNotFound({
         driverProfileId,
         rideId,
      })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('start')
   start(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') driverProfileId,
   ) {
      return this.startService.start({
         driverProfileId,
         rideId,
      })
   }

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('client-give-up')
   clientGiveUp(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.clientGiveUpService.clientGiveUp({ rideId, clientProfileId })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('arrived-destination')
   arrivedDestination(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') driverProfileId,
   ) {
      return this.arrivedDestinationService.arrivedDestination({
         driverProfileId,
         rideId,
      })
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('complete')
   complete(
      @Body() { rideId }: { rideId: string },
      @CognitoUser('sub') driverProfileId,
   ) {
      return this.completeService.complete({
         driverProfileId,
         rideId,
      })
   }

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('review')
   review(
      @Body()
      data: {
         note: number
         review: string
         rideId: string
      },
      @CognitoUser('sub') clientProfileId,
   ) {
      return this.reviewService.review({ clientProfileId, ...data })
   }

   @Get('find-ride-by-id-redis')
   findRide(@Query('rideId') rideId: string) {
      return this.getRideService.getRideRedis(rideId)
   }
}
