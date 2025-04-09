import {Body, Controller, Get, Post, SetMetadata, UseGuards} from "@nestjs/common";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {ApiOperation} from "@nestjs/swagger";
import {IngredientsService} from "./service/ingredients/ingredients.service";

@Controller('products')
export class IngredientsController {

    constructor(
        private readonly service: IngredientsService
    ){}

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create ingredients for food product'})
    @Post('/ingredients/add')
    async createIngredients(
        @Body() data: {
            name: string;
            icon: string;
        },
    ) {
        return await this.service.createIngredient(data);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Get all ingredients for food product'})
    @Get('/ingredients/list')
    async getIngredients(
    ) {
        return this.service.getIngredients();
    }
}