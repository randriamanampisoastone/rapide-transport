import { Module } from "@nestjs/common";
import { PromotionCodeController } from "./promotion-code.controller";
import { PromotionCodeService } from "./promotion-code.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Gateway } from "src/gateway/gateway";
import { LocationService } from "src/gateway/location/location.service";
import { NotificationService } from "src/notification/notification.service";
import { InfoOnRideService } from "src/ride/info-on-ride.service";
import { RedisService } from "src/redis/redis.service";

@Module({
   imports: [],
   controllers: [PromotionCodeController],
   providers: [
      PromotionCodeService,
      PrismaService,
      Gateway,
      LocationService,
      NotificationService,
      InfoOnRideService,
      RedisService,
   ],
})
export class PromotionCodeModule {}