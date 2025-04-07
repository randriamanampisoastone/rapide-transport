// src/orders/orders.service.ts
import {BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {AuditService} from "../audit/audit.service";
import {OrderStatus} from "@prisma/client";
import {CartService} from "../cart/cart.service";
import {AuditType} from "../../../enums/shop.enum";
import {CARD_EMPTY, CART_NOT_FOUND, PRODUCT_ENOUGH_STOCK} from "../../../constants/response.constant";


@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly cartService: CartService
    ) {
    }

    async createOder(userId: string) {
        const existingOrder = await this.prisma.order.findFirst({
            where: {
                userId,
                status: OrderStatus.PENDING,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        }
                    }
                },
            },
        });

        if (existingOrder) {
            return {
                ...existingOrder,
                items: existingOrder.items.map(item => ({
                    ...item,
                    priceAtPurchase: parseFloat(item.priceAtPurchase.toString())
                }))
            };
        }

        const cart = await this.validateAndGetCart(userId);
        await this.validateStockAvailability(cart.items);
        const {orderItems, totalAmount} = this.calculateOrderDetails(cart.items);
        const order = await this.createOrderTransaction(userId, cart, orderItems, totalAmount);

        await this.auditService.log({
            entityType: 'Order',
            entityId: order.id,
            action: AuditType.CREATE,
            oldValue: '',
            newValue: JSON.stringify(order),
            performedBy: userId,
        });

        return {
            ...order,
            items: order.items.map(item => ({
                ...item,
                priceAtPurchase: parseFloat(item.priceAtPurchase.toString())
            }))
        };
    }

    private async validateAndGetCart(userId: string) {
        const cart = this.cartService.getCart(userId);

        console.log("Cart", cart);
        if (!cart || (await cart).items.length === 0) {
            throw new HttpException({
                error: CARD_EMPTY,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return cart;
    }

    private async validateStockAvailability(cartItems: any[]) {
        for (const item of cartItems) {
            if (item.quantity > item.product.inventory) {
                throw new HttpException({
                    error: PRODUCT_ENOUGH_STOCK,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    private calculateOrderDetails(cartItems: any[]) {
        let totalAmount = 0;
        const orderItems = cartItems.map(item => {
            totalAmount += item.calculatedPrice;

            return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: (item.calculatedPrice == 0) ? 0 : (totalAmount / item.quantity),
            };
        });

        return {orderItems, totalAmount};
    }

    private async createOrderTransaction(
        userId: string,
        cart: any,
        orderItems: any[],
        totalAmount: number
    ) {
        return this.prisma.$transaction(async (tx) => {
            const newOrder = await this.createOrder(tx, userId, totalAmount, orderItems);
            await this.updateProductStock(tx, cart.items, userId);
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
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        }
                    }
                },
            },
        });
    }

    private async updateProductStock(tx: any, cartItems: any[], userId: string) {
        for (const item of cartItems) {
            const product = await tx.product.update({
                where: {id: item.productId},
                data: {
                    inventory: {
                        decrement: item.quantity,
                    },
                },
                select: {
                    inventory: true,
                },
            });

            await this.auditService.log({
                entityType: 'Product',
                entityId: item.productId,
                action: AuditType.UPDATE,
                oldValue: String(product.inventory + item.quantity),
                newValue: String(product.inventory),
                performedBy: userId,
            });
        }
    }

    private async clearCart(tx: any, cartId: string) {
        await tx.cartItem.deleteMany({
            where: {cartId},
        });

        await tx.cart.deleteMany({
            where: {id: cartId},
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
            where: {id},
        });

        if (!order) {
            throw new HttpException({
                error: CART_NOT_FOUND,
            }, HttpStatus.NOT_FOUND);
        }

        const oldValue = JSON.stringify(order);

        const updatedOrder = await this.prisma.order.update({
            where: {id},
            data: {status},
        });

        // Log the status change
        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: AuditType.CHANGE_STATUS,
            oldValue,
            newValue: JSON.stringify(updatedOrder),
            performedBy: userId,
        });

        return updatedOrder;
    }
}