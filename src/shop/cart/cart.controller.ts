import {Body, Controller, Delete, Get, Param, Patch, Post, SetMetadata, UseGuards} from "@nestjs/common";
import {CartService} from "./cart.service";
import {GetUser} from "../../jwt/get.user.decorator";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {ApiOperation} from "@nestjs/swagger";
import {AddCartItemDto} from "./dto/cart-item.dto";

@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService
    ) {}

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Fetch  cart for user'})
    @Get()
    async getCart(
        @GetUser('sub') user: string
    ){
        return this.cartService.getCart(user);
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Add product to cart (from carItem)'})
    @Post()
    async addToCart(
        @GetUser('sub') userId: string,
        @Body() data: AddCartItemDto
    ){
        return this.cartService.addToCart(userId, data);
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Remove a cartItem from cart'})
    @Delete('/:cartItemId')
    async removeFromCart(
        @Param('cartItemId') cartItemId: string
    ){
        return this.cartService.removeFromCart(cartItemId);
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Update product quantity in cart'})
    @Patch()
    async updateCartItemQuantity(
        @Body() updateCartItemDto: {
            cartItemId: string;
            quantity: number;
        }
    ){
        return this.cartService.updateCartItemQuantity(updateCartItemDto.cartItemId, updateCartItemDto.quantity);
    }
}