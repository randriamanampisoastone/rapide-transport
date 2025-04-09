import {PrismaService} from "../../../../prisma/prisma.service";
import {Utils} from "../../../Common/utils/utils";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ALREADY_EXIST} from "../../../../../constants/response.constant";

@Injectable()
export class IngredientsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly utils: Utils
    ) {
    }

    async createIngredient(data: { name: string; icon: string }) {
        const ingredient = await this.prismaService.ingredient.findFirst({
            where: {name: data.name}
        });

        if (ingredient) {
            throw new HttpException({
                error: ALREADY_EXIST,
            }, HttpStatus.CONFLICT);
        }

        return this.prismaService.ingredient.create({
            data
        });
    }

    async getIngredients() {
        return this.prismaService.ingredient.findMany({
            orderBy: {name: 'asc'}
        });
    }

    async getIngredient(id: string) {
        return this.prismaService.ingredient.findUnique({
            where: {id}
        });
    }

    async updateIngredient(id: string, data: { name?: string; icon?: string }) {
        return this.prismaService.ingredient.update({
            where: {id},
            data
        });
    }

    async deleteIngredient(id: string) {
        return this.prismaService.ingredient.delete({
            where: {id}
        });
    }

    async attachIngredientsToProduct(productId: string, ingredientIds: string[]) {
        // First, remove any existing ingredients
        await this.prismaService.productIngredient.deleteMany({
            where: {productId}
        });

        // Then add the new ones
        const data = ingredientIds.map(ingredientId => ({
            productId,
            ingredientId
        }));

        return this.prismaService.$transaction(
            data.map(item =>
                this.prismaService.productIngredient.create({
                    data: item
                })
            )
        );
    }

    async getProductIngredients(productId: string) {
        return this.prismaService.productIngredient.findMany({
            where: {productId},
            include: {ingredient: true}
        });
    }

}