import {Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, SetMetadata, UseGuards} from '@nestjs/common';
import {CategoriesService} from "./categories.service";
import {AddCategoryDto} from "./dto/add.category.dto";
import {RolesGuard} from "../../jwt/roles.guard";
import {UserRole} from "../../../enums/profile.enum";
import {EditCategoryDto} from "./dto/edit.category.dto";
import {ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse} from "@nestjs/swagger";
import {
    ERROR_CREATING_CATEGORY,
    ERROR_FETCHING_CATEGORY,
    ERROR_UPDATING_CATEGORY,
    INVALID_CATEGORY_TYPE_FOR,
    INVALID_PARAMS
} from "../../../constants/response.constant";
import {Public} from "../../jwt/public.decorator";


@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoryService: CategoriesService
    ) {
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create new category'})
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Category created successfully',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                name: {type: 'string'},
                description: {type: 'string', nullable: true},
                for: {type: 'string', enum: ['MART', 'FOOD']},
                icon: {type: 'string'},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'}
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Can\'t create category',
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    example: ERROR_CREATING_CATEGORY
                }
            }
        }
    })
    @Post('add')
    @ApiBody({type: AddCategoryDto})
    async addCategory(
        @Body()
        categoryDto: AddCategoryDto
    ) {
        return await this.categoryService.createCategory(categoryDto);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER, UserRole.ADMIN])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Update category by id'})
    @ApiParam({name: 'id', required: true, description: 'Category id'})
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Category created successfully',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                name: {type: 'string'},
                description: {type: 'string', nullable: true},
                for: {type: 'string', enum: ['MART', 'FOOD']},
                icon: {type: 'string'},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'}
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid params provided',
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    example: INVALID_PARAMS
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Can\'t update category',
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    example: ERROR_UPDATING_CATEGORY
                }
            }
        }
    })
    @Patch(':id')
    @ApiBody({type: EditCategoryDto})
    async updateCategory(
        @Param('id') id: string,
        @Body() editCategoryDto: EditCategoryDto
    ) {
        return await this.categoryService.updateCategory(id, editCategoryDto);
    }


    @Get()
    @Public()
    @ApiOperation({summary: 'Search categories by name and type'})
    @ApiQuery({name: 'name', required: false, description: 'Filter categories by name (case insensitive)'})
    @ApiQuery({name: 'for', required: false, description: 'Filter categories by type ( MART, FOOD)'})
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Categories retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                        name: {type: 'string'},
                        description: {type: 'string', nullable: true},
                        for: {type: 'string', enum: ['MART', 'FOOD']},
                        icon: {type: 'string'},
                        createdAt: {type: 'string', format: 'date-time'},
                        updatedAt: {type: 'string', format: 'date-time'}
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid category type provided',
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    example: INVALID_CATEGORY_TYPE_FOR
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error fetching categories',
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    example: ERROR_FETCHING_CATEGORY
                }
            }
        }
    })
    @ApiQuery({name: 'name', required: false, description: 'Filter categories by name (case insensitive)'})
    @ApiQuery({name: 'for', required: false, enum: ['MART', 'FOOD']})
    async searchCategory(
        @Query('name') name: string,
        @Query('for') forType: string,
    ) {
        return await this.categoryService.searchCategory(name, forType);
    }


}