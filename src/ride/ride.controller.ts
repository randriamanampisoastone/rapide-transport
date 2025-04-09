import {
   Controller,
   Post,
   Body,
   Get,
   Query,
   SetMetadata,
   UseGuards,
   Patch,
   Delete,
   ForbiddenException,
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
import { MethodType } from 'enums/payment.enum'
import { StoppedService } from './stopped.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { CheckRideService } from './check-ride.service'
import { AssignRideToDriverService } from './assign-ride-to-driver.service'
import { ReviewRideService } from './review-ride.service'
import { DeleteRideService } from './delete-ride.service'
import { ProfileStatus, UserRole } from '@prisma/client'
import { ROUTE_RIDE } from 'routes/main-routes'
import {
   ROUTE_ARRIVED_DESTINATION,
   ROUTE_ASSIGN_RIDE_TO_DRIVER,
   ROUTE_CANCELLED,
   ROUTE_CHECK_CLIENT_RIDE,
   ROUTE_CHECK_DRIVER_RIDE,
   ROUTE_CLIENT_GIVE_UP,
   ROUTE_CLIENT_NOT_FOUND,
   ROUTE_COMPLETE,
   ROUTE_CREATE_ITINERARY,
   ROUTE_CREATE_RIDE,
   ROUTE_DELETE_RIDE,
   ROUTE_DRIVER_ACCEPT,
   ROUTE_DRIVER_ARRIVED,
   ROUTE_DRIVER_ON_THE_WAY,
   ROUTE_FIND_RIDE_BY_ID_REDIS,
   ROUTE_REVIEW,
   ROUTE_SEND_REVIEW,
   ROUTE_START,
   ROUTE_STOPPED,
} from 'routes/secondary-routes'

@Controller(ROUTE_RIDE)
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

      private readonly assignRideToDriverService: AssignRideToDriverService,
      private readonly reviewRideService: ReviewRideService,

      private readonly deleteRideService: DeleteRideService,
   ) {}

   @Post(ROUTE_CREATE_ITINERARY)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   createItinerary(
      @Body()
      data: { pickUpLocation: LatLng; dropOffLocation: LatLng },
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.createItineraryService.createItinerary({
         ...data,
         clientProfileId,
      })
   }

   @Post(ROUTE_CREATE_RIDE)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   createRide(
      @Body()
      data: {
         pickUpLocation: LatLng
         dropOffLocation: LatLng
         vehicleType: VehicleType
         methodType: MethodType
         clientExpoToken: string
      },
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.createRideService.createRide({
         ...data,
         clientProfileId,
      })
   }

   @Post(ROUTE_CANCELLED)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   cancelled(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.cancelledService.cancelled({ rideId, clientProfileId })
   }

   @Post(ROUTE_DRIVER_ACCEPT)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   driverAccept(
      @Body() { rideId, plateNumber }: { rideId: string; plateNumber: string },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.driverAcceptService.driverAccept({
         driverProfileId,
         rideId,
         plateNumber,
      })
   }

   @Post(ROUTE_DRIVER_ON_THE_WAY)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   driverOnTheWay(
      @Body() data: { rideId: string; driverLocation: LatLng },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.driverOnTheWayService.driverOnTheWay({
         driverProfileId,
         ...data,
      })
   }

   @Post(ROUTE_STOPPED)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   stopped(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.stoppedService.clientStopped({ rideId, clientProfileId })
   }

   @Post(ROUTE_DRIVER_ARRIVED)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   drivertArrived(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.driverArrivedService.drivertArrived({
         driverProfileId,
         rideId,
      })
   }

   @Post(ROUTE_CLIENT_NOT_FOUND)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   clientNotFound(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.clientNotFoundService.clientNotFound({
         driverProfileId,
         rideId,
      })
   }

   @Post(ROUTE_START)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   start(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.startService.start({
         driverProfileId,
         rideId,
      })
   }

   @Post(ROUTE_CLIENT_GIVE_UP)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   clientGiveUp(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.clientGiveUpService.clientGiveUp({ rideId, clientProfileId })
   }

   @Post(ROUTE_ARRIVED_DESTINATION)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   arrivedDestination(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.arrivedDestinationService.arrivedDestination({
         driverProfileId,
         rideId,
      })
   }

   @Post(ROUTE_COMPLETE)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   complete(
      @Body() { rideId }: { rideId: string },
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
      @GetUser('locale') locale: string,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.completeService.complete({
         driverProfileId,
         rideId,
      }, locale)
   }

   @Post(ROUTE_REVIEW)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   review(
      @Body()
      data: {
         note: number
         review: string
         rideId: string
      },
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.reviewService.review({ clientProfileId, ...data })
   }

   @Get(ROUTE_FIND_RIDE_BY_ID_REDIS)
   @UseGuards(RolesGuard)
   findRide(@Query('rideId') rideId: string) {
      return this.getRideService.getRideRedis(rideId)
   }

   @Get(ROUTE_CHECK_CLIENT_RIDE)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   checkClientRide(
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.checkRideService.checkClientRide(clientProfileId)
   }

   @Get(ROUTE_CHECK_DRIVER_RIDE)
   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   checkDriverRide(
      @GetUser('sub') driverProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.checkRideService.checkDriverRide(driverProfileId)
   }

   @Patch(ROUTE_ASSIGN_RIDE_TO_DRIVER)
   @SetMetadata('allowedRole', [
      UserRole.RIDER,
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER_HUB,
      UserRole.CALL_CENTER,
   ])
   @UseGuards(RolesGuard)
   assignRideToDriver(
      @Query('driverProfileId') driverProfileId: string,
      @Query('rideId') rideId: string,
   ) {
      return this.assignRideToDriverService.assignRideToDriver(
         driverProfileId,
         rideId,
      )
   }

   @Patch(ROUTE_SEND_REVIEW)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   reviewRide(
      @GetUser('sub') clientProfileId: string,
      @Body()
      {
         rideId,
         note,
         review,
      }: { rideId: string; note: number; review: string },
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }

      return this.reviewRideService.addRideReview(
         rideId,
         clientProfileId,
         note,
         review,
      )
   }

   @Delete(ROUTE_DELETE_RIDE)
   @SetMetadata('allowedRole', [
      UserRole.RIDER,
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER_HUB,
      UserRole.CALL_CENTER,
   ])
   @UseGuards(RolesGuard)
   deleteRide(@Query('rideId') rideId: string) {
      return this.deleteRideService.deleteRide(rideId)
   }
}
