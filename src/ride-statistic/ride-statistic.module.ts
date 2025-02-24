import { Module } from "@nestjs/common";
import { RideStatisticController } from "./ride-statistic.controller";
import { RideStatisticService } from "./ride-statistic.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
   controllers: [RideStatisticController],
   providers: [RideStatisticService, PrismaService],
})
export class RideStatisticModule {}