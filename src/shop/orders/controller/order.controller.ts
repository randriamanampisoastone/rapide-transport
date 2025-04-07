import {Controller, Post, SetMetadata, UseGuards} from '@nestjs/common';
import {OrdersService} from "../orders.service";
import {UserRole} from "../../../../enums/profile.enum";
import {RolesGuard} from "../../../jwt/roles.guard";
import {ApiBearerAuth, ApiOperation} from "@nestjs/swagger";
import {GetUser} from "../../../jwt/get.user.decorator";

@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrdersService
    ) {}

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Add order for shipping'})
    @Post()
    @ApiBearerAuth()
    async createOder(
        @GetUser('sub') userId: string,
    ){
        return this.orderService.createOder(userId);
    }
}
