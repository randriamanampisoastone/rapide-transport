import {Body, Controller, HttpCode, HttpStatus, Post, SetMetadata, UseGuards} from '@nestjs/common';
import {AddCategoriesService} from "./add.categories.service";
import {AddCategoryDto} from "./dto/add.category.dto";
import {RolesGuard} from "../../jwt/roles.guard";
import {UserRole} from "../../../enums/profile.enum";


@Controller('categories')
export class CategoriesController {
    constructor(private readonly addCategoriesService: AddCategoriesService) {
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post('add')
    async addCategory(
        @Body()
        categoryDto: AddCategoryDto
    ) {
        return await this.addCategoriesService.createCategory(categoryDto);
    }
}