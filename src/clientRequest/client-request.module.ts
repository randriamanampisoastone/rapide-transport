import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ClientRequestService } from "./client-request.service";
import { ClientRequestController } from "./client-request.controller";
import { FindClientRequestService } from "./find-client-request.service";

@Module({
   imports: [],
   controllers: [ClientRequestController],
   providers: [PrismaService, ClientRequestService, FindClientRequestService],
})
export class ClientRequestModule {}