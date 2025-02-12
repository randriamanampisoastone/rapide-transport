import { Injectable } from '@nestjs/common'
import { Gateway } from 'src/gateway/gateway'
import { RideData } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { EVENT_ACCEPTED_RIDE } from 'constants/event.constant'
import { parseRidePostgresDataForRideData } from 'utils/rideDataParser.util'

export interface DriverAcceptDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class DriverAcceptService {
   constructor(
      private readonly gateway: Gateway,
      private readonly redisService: RedisService,
      private readonly postgresService: PrismaService,
   ) {}

   async driverAccept(driverAcceptDto: DriverAcceptDto) {
      try {
         const rideId = driverAcceptDto.rideId
         const driverProfileId = driverAcceptDto.driverProfileId

         const ride = await this.redisService.get(`${RIDE_PREFIX + rideId}`)

         if (!ride) {
            throw new Error('Ride not found')
         }

         const rideData: RideData = JSON.parse(ride)

         if (rideData.status !== RideStatus.FINDING_DRIVER) {
            throw new Error('Ride is not in FINDING_DRIVER status')
         }

         const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,
            ...rideDataRest
         } = rideData

         const rideDataUpdated = {
            status: RideStatus.DRIVER_ACCEPTED,
            driverProfileId,
            ...rideDataRest,
         }

         const rideDataUpdatedString = JSON.stringify(rideDataUpdated)

         await this.redisService.set(
            `${RIDE_PREFIX + rideId}`,
            rideDataUpdatedString,
            1800,
         )

         const rideDataUpdatedOnDb = await this.postgresService.ride.update({
            where: {
               rideId,
            },
            include: {
               clientProfile: {
                  include: {
                     profile: true,
                  },
               },
               driverProfile: {
                  include: {
                     profile: true,
                  },
               },
            },
            data: {
               driverProfileId,
               status: RideStatus.DRIVER_ACCEPTED,
            },
         })

         const clientProfileId = rideDataUpdated.clientProfileId

         this.gateway.sendNotificationToClient(
            clientProfileId,
            EVENT_ACCEPTED_RIDE,
            {
               ...rideDataUpdatedOnDb,
            },
         )

         this.gateway.sendNotificationToAdmin(EVENT_ACCEPTED_RIDE, {
            ...parseRidePostgresDataForRideData(rideDataUpdatedOnDb),
         })

         return { ...rideDataUpdated }
      } catch (error) {
         throw error
      }
   }
}
