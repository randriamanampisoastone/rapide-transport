// src/orders/orders.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {AuditService} from "../audit/audit.service";
import {OrderStatus} from "@prisma/client";
import {AddOrderDto} from "./dto/order.dto";
import {CartService} from "../cart/cart.service";


@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly cartService: CartService
    ) {}

   async createOder(userId: string, createOrderDto: AddOrderDto) {
        const cart = await this.validateAndGetCart(userId);
        await this.validateStockAvailability(cart.items);
        const { orderItems, totalAmount } = this.calculateOrderDetails(cart.items);

        const order = await this.createOrderTransaction(userId, cart, orderItems, totalAmount);

        await this.auditService.log({
            entityType: 'Order',
            entityId: order.id,
            action: 'CREATE',
            newValue: JSON.stringify(order),
            performedBy: userId,
        });

        return order;
    }

    private async validateAndGetCart(userId: string) {
        const cart = this.cartService.getCart(userId);

        if (!cart || (await cart).items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        return cart;
    }

    private async validateStockAvailability(cartItems: any[]) {
        for (const item of cartItems) {
            if (item.quantity > item.product.inventory) {
                throw new BadRequestException(`Product "${item.product.name}" does not have enough stock.`);
            }
        }
    }

    private calculateOrderDetails(cartItems: any[]) {
        let totalAmount = 0;
        const orderItems = cartItems.map(item => {
            const itemTotal = Number(item.product.price) * item.quantity;
            totalAmount += itemTotal;

            return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.product.price,
            };
        });

        return { orderItems, totalAmount };
    }

    private async createOrderTransaction(
        userId: string,
        cart: any,
        orderItems: any[],
        totalAmount: number
    ) {
        return this.prisma.$transaction(async (tx) => {
            const newOrder = await this.createOrder(tx, userId, totalAmount, orderItems);
            await this.updateProductStock(tx, cart.items);
            await this.clearCart(tx, cart.id);
            await this.createPaymentRecord(tx, newOrder.id);
            await this.createShippingRecord(tx, newOrder.id);

            return newOrder;
        });
    }

    private async createOrder(tx: any, userId: string, totalAmount: number, orderItems: any[]) {
        return tx.order.create({
            data: {
                userId,
                totalPrice: totalAmount,
                status: OrderStatus.PENDING,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: true,
            },
        });
    }

    private async updateProductStock(tx: any, cartItems: any[]) {
        for (const item of cartItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    inventory: {
                        decrement: item.quantity,
                    },
                },
            });
        }
    }

    private async clearCart(tx: any, cartId: string) {
        await tx.cartItem.deleteMany({
            where: { cartId },
        });
    }

    private async createPaymentRecord(tx: any, orderId: string) {
        await tx.payment.create({
            data: {
                orderId,
                status: 'PENDING',
            },
        });
    }

    private async createShippingRecord(tx: any, orderId: string) {
        await tx.shipping.create({
            data: {
                orderId,
            },
        });
    }

    async updateStatus(id: string, status: OrderStatus, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const oldValue = JSON.stringify(order);

        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: { status },
        });

        // Log the status change
        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: 'STATUS_CHANGE',
            oldValue,
            newValue: JSON.stringify(updatedOrder),
            performedBy: userId,
        });

        return updatedOrder;
    }
}