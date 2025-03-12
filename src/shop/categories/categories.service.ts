import {PrismaService} from "../../prisma/prisma.service";
import {AddCategoryDto} from "./dto/add.category.dto";
import {
    ERROR_CREATING_CATEGORY,
    ERROR_FETCHING_CATEGORY,
    ERROR_UPDATING_CATEGORY, INVALID_CATEGORY_TYPE_FOR
} from "../../../constants/response.constant";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {EditCategoryDto} from "./dto/edit.category.dto";
import {CategoryTypeFor} from "../../../enums/shop.enum";

@Injectable()
export class CategoriesService {

    constructor(private readonly prismaService: PrismaService) {
    }

    async createCategory(categoryDto: AddCategoryDto) {
        try {
            return await this.prismaService.category.create({
                data: categoryDto
            });
        } catch (error) {
            console.log(error);
            throw new HttpException({
                error: ERROR_CREATING_CATEGORY
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCategory(id: string, categoryDto: EditCategoryDto) {
        try {
            return await this.prismaService.category.update({
                where: {id},
                data: categoryDto
            });
        } catch (error) {
            console.log(error);
            throw new HttpException({
                error: ERROR_UPDATING_CATEGORY
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async searchCategory(name?: string, forType?: string) {
        try {
            const where: any = {};

            if (name) {
                where.name = {
                    contains: name,
                    mode: 'insensitive'
                };
            }

            if (forType) {
                const categoryFor = CategoryTypeFor[forType as keyof typeof CategoryTypeFor];
                if (!categoryFor) {
                    throw new HttpException({
                        error: INVALID_CATEGORY_TYPE_FOR
                    }, HttpStatus.BAD_REQUEST);
                }
                where.for = categoryFor;
            }

            return await this.prismaService.category.findMany({where});
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                error: ERROR_FETCHING_CATEGORY + `: ${error.message}`
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
