import {
   BadRequestException,
   ForbiddenException,
   HttpException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { EVENT_CLIENT_NOT_FOUND } from 'constants/event.constant'

export interface ClientNotFoundDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class ClientNotFoundService {
   constructor(
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly prismaService: PrismaService,
   ) {}

   async clientNotFound(clientNotFoundDto: ClientNotFoundDto) {
      try {
         const rideId = clientNotFoundDto.rideId
         const driverProfileId = clientNotFoundDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new NotFoundException('RideNotFound')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.DRIVER_ARRIVED) {
            // throw new Error('Ride is not in DRIVER_ARRIVED status')
            throw new BadRequestException(
               'Ride is not in DRIVER_ARRIVED status',
            )
         }
         if (rideData.driverProfileId !== driverProfileId) {
            // throw new Error('Driver is not the driver of the ride')
            throw new ForbiddenException('Driver is not the driver of the ride')
         }

         const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,
            ...rideDataRest
         } = rideData

         const rideDataUpdated = {
            status: RideStatus.CLIENT_NOT_FOUND,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            1800,
         )
         await this.prismaService.ride.update({
            where: {
               rideId,
            },
            data: {
               status: RideStatus.CLIENT_NOT_FOUND,
            },
         })
         const clientProfileId = rideDataUpdated.clientProfileId

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_CLIENT_NOT_FOUND,
            {},
         )
         this.gateway.sendNotificationToAdmin(EVENT_CLIENT_NOT_FOUND, {
            ...rideDataUpdated,
         })
      } catch (error) {
         // throw error
         throw new HttpException(error.message, error.status)
      }
   }
}
