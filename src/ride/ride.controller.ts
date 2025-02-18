import {
   Controller,
   Post,
   Body,
   Get,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { CreateItineraryService } from './create-itinerary.service'
import { CreateRideService } from './create-ride.service'
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
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { CheckRideService } from './check-ride.service'

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
      private readonly checkRideService: CheckRideService,

      private readonly getRideService: GetRideService,
   ) {}

   @Post('create-itinerary')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   createItinerary(
      @Body()
      data: { pickUpLocation: LatLng; dropOffLocation: LatLng },
      @GetUser('sub') clientProfileId: string,
   ) {
      return this.createItineraryService.createItinerary({
         ...data,
         clientProfileId,
      })
   }

   @Post('create-ride')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   createRide(
      @Body()
      data: {
         pickUpLocation: LatLng
         dropOffLocation: LatLng
         vehicleType: VehicleType
         paymentMethodType: PaymentMethodType
      },
      @GetUser('sub') clientProfileId: string,
   ) {
      return this.createRideService.createRide({
         ...data,
         clientProfileId,
      })
   }

   @Post('cancelled')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   cancelled(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') clientProfileId: string,
   ) {
      return this.cancelledService.cancelled({ rideId, clientProfileId })
   }

   @Post('driver-accept')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   driverAccept(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.driverAcceptService.driverAccept({ driverProfileId, rideId })
   }

   @Post('driver-on-the-way')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   driverOnTheWay(
      @Body() data: { rideId: string; driverLocation: LatLng },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.driverOnTheWayService.driverOnTheWay({
         driverProfileId,
         ...data,
      })
   }

   @Post('stopped')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   stopped(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') clientProfileId: string,
   ) {
      return this.stoppedService.clientStopped({ rideId, clientProfileId })
   }

   @Post('driver-arrived')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   drivertArrived(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.driverArrivedService.drivertArrived({
         driverProfileId,
         rideId,
      })
   }

   @Post('client-not-found')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   clientNotFound(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.clientNotFoundService.clientNotFound({
         driverProfileId,
         rideId,
      })
   }

   @Post('start')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   start(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.startService.start({
         driverProfileId,
         rideId,
      })
   }

   @Post('client-give-up')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   clientGiveUp(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') clientProfileId: string,
   ) {
      return this.clientGiveUpService.clientGiveUp({ rideId, clientProfileId })
   }

   @Post('arrived-destination')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   arrivedDestination(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.arrivedDestinationService.arrivedDestination({
         driverProfileId,
         rideId,
      })
   }

   @Post('complete')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   complete(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
   ) {
      return this.completeService.complete({
         driverProfileId,
         rideId,
      })
   }

   @Post('review')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   review(
      @Body()
      data: {
         note: number
         review: string
         rideId: string
      },
      @GetUser('sub') clientProfileId: string,
   ) {
      return this.reviewService.review({ clientProfileId, ...data })
   }
   @Get('find-ride-by-id-redis')
   @UseGuards(RolesGuard)
   findRide(@Query('rideId') rideId: string) {
      return this.getRideService.getRideRedis(rideId)
   }

   @Get('check-client-ride')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   checkClientRide(@GetUser('sub') clientProfileId: string) {
      return this.checkRideService.checkClientRide(clientProfileId)
   }

   @Get('check-driver-ride')
   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   checkDriverRide(@GetUser('sub') driverProfileId: string) {
      return this.checkRideService.checkDriverRide(driverProfileId)
   }
}
