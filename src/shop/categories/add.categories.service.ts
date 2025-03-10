import {PrismaService} from "../../prisma/prisma.service";
import {AddCategoryDto} from "./dto/add.category.dto";
import {ERROR_CREATING_CATEGORY} from "../../../constants/response.constant";

export class AddCategoriesService {

    constructor(private readonly prismaService: PrismaService) {
    }

    async createCategory(categoryDto: AddCategoryDto) {
        try {
            return await this.prismaService.category.create({
                data: categoryDto
            });
        } catch (error) {
            throw new Error(ERROR_CREATING_CATEGORY + `: ${error.message}`);
        }

    }

}
