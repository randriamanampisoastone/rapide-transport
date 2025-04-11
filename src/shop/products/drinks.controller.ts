import {Body, Controller, Get, Param, Post, SetMetadata, UseGuards} from "@nestjs/common";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {ApiOperation, ApiQuery} from "@nestjs/swagger";
import {Public} from "src/jwt/public.decorator";
import {DrinksService} from "./service/drinks/drinks.service";

@Controller('products')
export class DrinksController {

    constructor(
        private readonly service: DrinksService
    ){}

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create sauces for food product'})
    @Post('/drinks/add')
    async createIngredients(
        @Body() data: {
            name: string;
        },
    ) {
        return await this.service.createDrink(data);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Get all sauces'})
    @Get('/drinks/list')
    async getIngredients(
    ) {
        return this.service.getDrinks();
    }

    @Public()
    @ApiOperation({summary: 'Get c=sauces for a given product'})
    @ApiQuery({name: 'id', required: true, description: 'Product id'})
    @Get('/drinks/list/:id')
    async getProductSauces(
        @Param('id') id: string
    ) {
        return this.service.getProductDrinks(id);
    }
}