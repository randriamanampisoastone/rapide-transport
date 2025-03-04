import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ClientRequestService } from "./client-request.service";
import { ClientRequestController } from "./client-request.controller";

@Module({
    imports: [],
    controllers: [ClientRequestController],
    providers: [PrismaService, ClientRequestService]
})
export class ClientRequestModule {}