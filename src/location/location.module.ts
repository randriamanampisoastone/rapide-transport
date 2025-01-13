import { Module } from "@nestjs/common";
import { LocationService } from "./location.service";
import { RedisService } from "src/redis/redis.service";
import { LocationController } from "./location.controller";


@Module({
    imports: [],
    controllers: [LocationController],
    providers: [LocationService, RedisService]
})
export class LocationModule {}