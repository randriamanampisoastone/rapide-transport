import {PrismaService} from "../../prisma/prisma.service";
import {AddCartItemDto} from "./dto/cart-item.dto";
import {HttpException, HttpStatus} from "@nestjs/common";
import {CART_NOT_FOUND, ERROR_REMOVING_CART} from "../../../constants/response.constant";

export class CartService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async getCart(userId: string){
        return this.prismaService.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async addToCart(userId: string, addCartItemDto: AddCartItemDto) {
        // Find or create cart for user
        let cart = await this.prismaService.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            cart = await this.prismaService.cart.create({
                data: { userId }
            });
        }

        // Check if product already in cart
        const existingCartItem = await this.prismaService.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: addCartItemDto.productId
            }
        });

        if (existingCartItem) {
            // Update quantity if item exists
            return this.prismaService.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: existingCartItem.quantity + addCartItemDto.quantity
                },
                include: { product: true }
            });
        }

        // Create new cart item
        return this.prismaService.cartItem.create({
            data: {
                cartId: cart.id,
                productId: addCartItemDto.productId,
                quantity: addCartItemDto.quantity
            },
            include: { product: true }
        });
    }

    async removeFromCart(cartItemId: string) {
        try {
            const cartItem = await this.prismaService.cartItem.findUnique({
                where: {id: cartItemId}
            });

            if (!cartItem) {
                throw new HttpException({
                    error: CART_NOT_FOUND,
                }, HttpStatus.NOT_FOUND);
            }

            return this.prismaService.cartItem.delete({
                where: {id: cartItemId}
            });
        }catch (e) {
            throw new HttpException({
                error: ERROR_REMOVING_CART,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCartItemQuantity(cartItemId: string, quantity: number) {
        const cartItem = await this.prismaService.cartItem.findUnique({
            where: { id: cartItemId }
        });

        if (!cartItem) {
            throw new HttpException({
                error: CART_NOT_FOUND,
            }, HttpStatus.NOT_FOUND);
        }

        return this.prismaService.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: { product: true }
        });
    }

}