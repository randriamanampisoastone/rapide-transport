import { Module } from "@nestjs/common";
import { ResetBalanceServce } from "./reset-balance.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AccountBalanceController } from "./accountBalance.controller";

@Module({
   imports: [],
   providers: [ResetBalanceServce, PrismaService],
   controllers: [AccountBalanceController],
})
export class AccountBalanceModule {}