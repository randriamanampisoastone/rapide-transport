// // src/orders/orders.service.ts
// import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// import {PrismaService} from "../../prisma/prisma.service";
// import {CreateOrderDto} from "./dto/create-order.dto";
// import {AuditService} from "../audit/audit.service";
// import {OrderStatus} from "@prisma/client";
//
//
// @Injectable()
// export class OrdersService {
//     constructor(
//         private readonly prisma: PrismaService,
//         private readonly auditService: AuditService
//     ) {}
//
//     async create(userId: string, createOrderDto: CreateOrderDto) {
//         // Get user cart
//         const cart = await this.prisma.cart.findUnique({
//             where: { userId },
//             include: {
//                 items: {
//                     include: {
//                         product: true,
//                     },
//                 },
//             },
//         });
//
//         if (!cart || cart.items.length === 0) {
//             throw new BadRequestException('Cart is empty');
//         }
//
//         // Check stock for all items
//         for (const item of cart.items) {
//             if (item.quantity > item.product.inventory) {
//                 throw new BadRequestException(`Product "${item.product.name}" does not have enough stock.`);
//             }
//         }
//
//         // Calculate total amount
//         let totalAmount = 0;
//         const orderItems = cart.items.map(item => {
//             const itemTotal = Number(item.product.price) * item.quantity;
//             totalAmount += itemTotal;
//
//             return {
//                 productId: item.productId,
//                 quantity: item.quantity,
//                 priceAtPurchase: item.product.price,
//             };
//         });
//
//         // Create order with items in a transaction
//         const order = await this.prisma.$transaction(async (tx) => {
//             // Create order
//             const newOrder = await tx.order.create({
//                 data: {
//                     userId,
//                     totalPrice,
//                     status: 'PENDING',
//                     items: {
//                         create: orderItems,
//                     },
//                 },
//                 include: {
//                     items: true,
//                 },
//             });
//
//             // Update product stock
//             for (const item of cart.items) {
//                 await tx.product.update({
//                     where: { id: item.productId },
//                     data: {
//                         inventory: {
//                             decrement: item.quantity,
//                         },
//                     },
//                 });
//             }
//
//             // Clear cart
//             await tx.cartItem.deleteMany({
//                 where: { cartId: cart.id },
//             });
//
//             // Create initial payment record
//             await tx.payment.create({
//                 data: {
//                     orderId: newOrder.id,
//                     status: 'PENDING',
//                 },
//             });
//
//             // Create shipping record
//             await tx.shipping.create({
//                 data: {
//                     orderId: newOrder.id,
//                 },
//             });
//
//             return newOrder;
//         });
//
//         // Log the order creation
//         await this.auditService.log({
//             entityType: 'Order',
//             entityId: order.id,
//             action: 'CREATE',
//             newValue: JSON.stringify(order),
//             performedBy: userId,
//         });
//
//         return order;
//     }
//
//     async updateStatus(id: string, status: OrderStatus, userId: string) {
//         const order = await this.prisma.order.findUnique({
//             where: { id },
//         });
//
//         if (!order) {
//             throw new NotFoundException('Order not found');
//         }
//
//         const oldValue = JSON.stringify(order);
//
//         const updatedOrder = await this.prisma.order.update({
//             where: { id },
//             data: { status },
//         });
//
//         // Log the status change
//         await this.auditService.log({
//             entityType: 'Order',
//             entityId: id,
//             action: 'STATUS_CHANGE',
//             oldValue,
//             newValue: JSON.stringify(updatedOrder),
//             performedBy: userId,
//         });
//
//         return updatedOrder;
//     }
// }