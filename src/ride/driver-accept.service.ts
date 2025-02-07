import { Injectable } from '@nestjs/common'
import { InjectModel, Model } from 'nestjs-dynamoose'

import { Gateway } from 'src/gateway/gateway'
import { RideData, RideDataKey } from 'interfaces/ride.interface'
import { RideStatus } from 'enums/ride.enum'
import { RedisService } from 'src/redis/redis.service'
import { RIDE_PREFIX } from 'constants/redis.constant'
import { PrismaService } from 'src/prisma/prisma.service'

export interface DriverAcceptDto {
   driverProfileId: string
   rideId: string
}

@Injectable()
export class DriverAcceptService {
   constructor(
      @InjectModel('Ride')
      private readonly rideModel: Model<RideData, RideDataKey>,

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

         // await this.rideModel.update(
         //    {
         //       rideId,
         //    },
         //    {
         //       driverProfileId,
         //       status: RideStatus.DRIVER_ACCEPTED,
         //    },
         // )
         await this.postgresService.ride.update({
            where: {
               rideId,
            },
            data: {
               driverProfileId,
               status: RideStatus.DRIVER_ACCEPTED,
            },
         })

         const clientProfileId = rideDataUpdated.clientProfileId

         const topic = 'acceptedRide'
         this.gateway.sendNotificationToClient(clientProfileId, topic, {
            ...rideDataUpdated,
         })

         this.gateway.sendNotificationToAdmin(topic, {
            ...rideDataUpdated,
         })

         return { ...rideDataUpdated }
      } catch (error) {
         throw error
      }
   }
}
