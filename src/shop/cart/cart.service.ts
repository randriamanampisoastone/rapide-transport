import {PrismaService} from "../../prisma/prisma.service";
import {AddCartItemDto, UpdateCartItemDto} from "./dto/cart-item.dto";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {
    CART_NOT_FOUND,
    ERROR_FETCHING_CART,
    ERROR_REMOVING_CART,
    ERROR_UPDATING_CART
} from "../../../constants/response.constant";

@Injectable()
export class CartService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async getCart(userId: string) {
        try {
            const cart = await this.prismaService.cart.findUnique({
                where: {userId},
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    seller: {
                                        select: {
                                            sub: true,
                                            firstName: true,
                                            lastName: true,
                                        }
                                    },
                                    discounts: {
                                        select: {
                                            discount: {
                                                select: {
                                                    type: true,
                                                    value: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!cart) {
                throw new HttpException({
                    error: CART_NOT_FOUND,
                }, HttpStatus.NOT_FOUND);
            }

            return {
                ...cart,
                items: cart.items.map(item => ({
                    ...item,
                    calculatedPrice: parseFloat(item.calculatedPrice.toString()),
                    product: {
                        ...item.product,
                        price: parseFloat(item.product.price.toString())
                    }
                }))
            };
        } catch (e) {
            throw new HttpException({
                error: ERROR_FETCHING_CART,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addToCart(userId: string, addCartItemDto: AddCartItemDto) {
        // Find or create cart for user
        let cart = await this.prismaService.cart.findUnique({
            where: {userId}
        });

        if (!cart) {
            cart = await this.prismaService.cart.create({
                data: {userId}
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
            // Update quantity and save the provided calculatedPrice value
            const updated= await this.prismaService.cartItem.update({
                where: {id: existingCartItem.id},
                data: {
                    quantity: existingCartItem.quantity + addCartItemDto.quantity,
                    calculatedPrice: addCartItemDto.calculatedPrice
                },
                include: {product: true}
            });

            return {
                ...updated,
                calculatedPrice: parseFloat(updated.calculatedPrice.toString()),
            }
        }

        // Create new cart item with provided calculatedPrice
        const created = await this.prismaService.cartItem.create({
            data: {
                cartId: cart.id,
                productId: addCartItemDto.productId,
                quantity: addCartItemDto.quantity,
                calculatedPrice: Number(addCartItemDto.calculatedPrice.toString())
            },
            include: {product: true}
        });

        return {
            ...created,
            calculatedPrice: parseFloat(created.calculatedPrice.toString()),
        }
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
        } catch (e) {
            throw new HttpException({
                error: ERROR_REMOVING_CART,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCartItemQuantity(updateCartItemDto: UpdateCartItemDto) {
        try {
            const cartItem = await this.prismaService.cartItem.findUnique({
                where: {id: updateCartItemDto.cartItemId}
            });

            if (!cartItem) {
                throw new HttpException({
                    error: CART_NOT_FOUND,
                }, HttpStatus.NOT_FOUND);
            }

            return this.prismaService.cartItem.update({
                where: {id: updateCartItemDto.cartItemId},
                data: {
                    quantity: updateCartItemDto.quantity,
                    calculatedPrice: updateCartItemDto.calculatedPrice
                },
                include: {product: true}
            });
        } catch (e) {
            throw new HttpException({
                error: ERROR_UPDATING_CART,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}