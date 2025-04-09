import {Body, Controller, Get, Param, Post, SetMetadata, UseGuards} from "@nestjs/common";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {ApiOperation, ApiQuery} from "@nestjs/swagger";
import {IngredientsService} from "./service/ingredients/ingredients.service";
import {SaucesService} from "./service/sauces/sauces.service";
import { Public } from "src/jwt/public.decorator";

@Controller('products')
export class SaucesController {

    constructor(
        private readonly service: SaucesService
    ){}

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create sauces for food product'})
    @Post('/sauces/add')
    async createIngredients(
        @Body() data: {
            name: string;
        },
    ) {
        return await this.service.createSauce(data);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Get all sauces'})
    @Get('/sauces/list')
    async getIngredients(
    ) {
        return this.service.getSauces();
    }

    @Public()
    @ApiOperation({summary: 'Get c=sauces for a given product'})
    @ApiQuery({name: 'id', required: true, description: 'Product id'})
    @Get('/sauces/list/:id')
    async getProductSauces(
        @Param('id') id: string
    ) {
        return this.service.getProductSauces(id);
    }
}