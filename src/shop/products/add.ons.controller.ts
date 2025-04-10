import {Body, Controller, Get, Param, Post, SetMetadata, UseGuards} from "@nestjs/common";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {ApiOperation, ApiQuery} from "@nestjs/swagger";
import {Public} from "src/jwt/public.decorator";
import {AddOnsService} from "./service/addOns/add.ons.service";

@Controller('products')
export class AddOnsController {

    constructor(
        private readonly service: AddOnsService
    ){}

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create sauces for food product'})
    @Post('/extras/add')
    async createIngredients(
        @Body() data: {
            name: string;
        },
    ) {
        return await this.service.createAddOn(data);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Get all sauces'})
    @Get('/extras/list')
    async getIngredients(
    ) {
        return this.service.getAddOns();
    }

    @Public()
    @ApiOperation({summary: 'Get c=sauces for a given product'})
    @ApiQuery({name: 'id', required: true, description: 'Product id'})
    @Get('/extras/list/:id')
    async getProductSauces(
        @Param('id') id: string
    ) {
        return this.service.getProductAddOns(id);
    }
}