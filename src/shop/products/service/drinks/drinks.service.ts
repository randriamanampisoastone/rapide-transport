import {PrismaService} from "../../../../prisma/prisma.service";
import {Utils} from "../../../Common/utils/utils";

export class DrinksService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly utils: Utils
    ) {
    }


    async createDrink(data: { name: string }) {
        return this.prismaService.drink.create({
            data
        });
    }

    async getDrinks() {
        return this.prismaService.drink.findMany({
            orderBy: {name: 'asc'}
        });
    }

    async getDrink(id: string) {
        return this.prismaService.drink.findUnique({
            where: {id}
        });
    }

    async updateDrink(id: string, data: { name?: string }) {
        return this.prismaService.drink.update({
            where: {id},
            data
        });
    }

    async deleteDrink(id: string) {
        return this.prismaService.drink.delete({
            where: {id}
        });
    }

    async attachDrinksToProduct(productId: string, drinkIds: string[]) {
        // Validate maximum of 2 drinks
        if (drinkIds.length > 2) {
            throw new Error('Maximum 2 drinks allowed per product');
        }

        // Remove existing drinks
        await this.prismaService.productDrink.deleteMany({
            where: {productId}
        });

        // Add new drinks
        const data = drinkIds.map(drinkId => ({
            productId,
            drinkId
        }));

        return this.prismaService.$transaction(
            data.map(item =>
                this.prismaService.productDrink.create({
                    data: item
                })
            )
        );
    }

    async getProductDrinks(productId: string) {
        return this.prismaService.productDrink.findMany({
            where: {productId},
            include: {drink: true}
        });
    }


}