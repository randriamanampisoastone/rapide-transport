import { Module } from '@nestjs/common';
import { OrderController } from './controller/order.controller';
import {OrdersService} from "./orders.service";
import {PrismaService} from "../../prisma/prisma.service";
import {AuditService} from "../audit/audit.service";
import {CartService} from "../cart/cart.service";

@Module({
  controllers: [OrderController],
  providers: [
      OrdersService,
      PrismaService,
      AuditService,
      CartService
  ]
})
export class OrdersModule {}
