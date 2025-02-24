import { Injectable } from '@nestjs/common'
import { subDays } from 'date-fns'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RideStatisticService {
   constructor(private readonly prismaService: PrismaService) {}

   async getDriverStatistic(driverProfileId: string) {
      try {
         const fiveDaysAgo = subDays(new Date(), 5)

         // Exécuter toutes les requêtes Prisma en parallèle pour améliorer la performance
         const [
            totalRides,
            allRides,
            allRidesInLastFiveDays,
            totalBalance,
            allRidesInFiveDaysBalance,
            ridesStatus,
            ridesStatusLastFiveDays,
            lastFiveDaysStatsNonFormated,
         ] = await Promise.all([
            // Nombre total de courses pour ce driver
            this.prismaService.ride.count({
               where: { driverProfileId },
            }),

            // Nombre total de courses pour chaque type de véhicule
            this.prismaService.ride.groupBy({
               by: ['vehicleType'],
               where: { driverProfileId },
               _count: { vehicleType: true },
            }),

            // Nombre de courses effectuées ces 5 derniers jours
            this.prismaService.ride.count({
               where: {
                  driverProfileId,
                  createdAt: { gte: fiveDaysAgo },
               },
            }),

            // Total de realPrice pour ce driver (uniquement si `status` est `COMPLETED`)
            this.prismaService.ride.aggregate({
               where: { driverProfileId, status: 'COMPLETED' },
               _sum: { realPrice: true },
            }),

            // Total de realPrice des 5 derniers jours pour chaque VehicleType (uniquement si `status` est `COMPLETED`)
            this.prismaService.ride.groupBy({
               by: ['vehicleType'],
               where: {
                  driverProfileId,
                  status: 'COMPLETED',
                  createdAt: { gte: fiveDaysAgo },
               },
               _sum: { realPrice: true },
            }),

            // Nombre total de courses par status
            this.prismaService.ride.groupBy({
               by: ['status'],
               where: { driverProfileId },
               _count: { status: true },
            }),

            // Nombre de courses par status sur les 5 derniers jours
            this.prismaService.ride.groupBy({
               by: ['status'],
               where: {
                  driverProfileId,
                  createdAt: { gte: fiveDaysAgo },
               },
               _count: { status: true },
            }),

            this.prismaService.$queryRaw<
               {
                  date: Date
                  status: string
                  count: bigint
                  totalBalance: bigint
                  totalRides: bigint
               }[]
            >`SELECT DATE("createdAt") as "date", "status", COUNT(*) as "count", 
               SUM(CASE WHEN "status" = 'COMPLETED' THEN "realPrice" ELSE 0 END) as "totalBalance", 
               COUNT("rideId") as "totalRides" 
               FROM "Ride" 
               WHERE "driverProfileId" = ${driverProfileId} 
               AND "createdAt" >= ${fiveDaysAgo} 
               GROUP BY "date", "status" 
               ORDER BY "date" ASC;`,
         ])

         const lastFiveDaysStats = lastFiveDaysStatsNonFormated.map((stat) => ({
            date: stat.date,
            status: stat.status,
            count: Number(stat.count), // Convertir BigInt en Number
            totalBalance: Number(stat.totalBalance),
            totalRides: Number(stat.totalRides),
         }))

         return {
            totalRides,
            allRides: allRides.map(({ vehicleType, _count }) => ({
               vehicleType,
               count: _count.vehicleType,
            })),
            allRidesInLastFiveDays,
            totalBalance: totalBalance._sum.realPrice || 0,
            allRidesInFiveDaysBalance: allRidesInFiveDaysBalance.map(
               ({ vehicleType, _sum }) => ({
                  vehicleType,
                  totalBalance: _sum.realPrice || 0,
               }),
            ),
            ridesStatus: ridesStatus.map(({ status, _count }) => ({
               status,
               count: _count.status,
            })),
            ridesStatusLastFiveDays: ridesStatusLastFiveDays.map(
               ({ status, _count }) => ({
                  status,
                  count: _count.status,
               }),
            ),
            lastFiveDaysStats,
         }
      } catch (error) {
         throw error
      }
   }
}
