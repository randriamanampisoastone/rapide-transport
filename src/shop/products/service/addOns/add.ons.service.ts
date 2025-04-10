import {PrismaService} from "../../../../prisma/prisma.service";
import {Utils} from "../../../Common/utils/utils";

export class AddOnsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly utils: Utils
    ) { }

    async createAddOn(data: { name: string }) {
        return this.prismaService.addOn.create({
            data
        });
    }

    async getAddOns() {
        return this.prismaService.addOn.findMany({
            orderBy: {name: 'asc'}
        });
    }

    async getAddOn(id: string) {
        return this.prismaService.addOn.findUnique({
            where: {id}
        });
    }

    async updateAddOn(id: string, data: { name?: string }) {
        return this.prismaService.addOn.update({
            where: {id},
            data
        });
    }

    async deleteAddOn(id: string) {
        return this.prismaService.addOn.delete({
            where: {id}
        });
    }

    async attachAddOnsToProduct(productId: string, addOnIds: string[]) {
        // Validate maximum of 2 add-ons
        if (addOnIds.length > 2) {
            throw new Error('Maximum 2 add-ons allowed per product');
        }

        // Remove existing add-ons
        await this.prismaService.productAddOn.deleteMany({
            where: { productId }
        });

        // Add new add-ons
        const data = addOnIds.map(addOnId => ({
            productId,
            addOnId
        }));

        return this.prismaService.$transaction(
            data.map(item =>
                this.prismaService.productAddOn.create({
                    data: item
                })
            )
        );
    }

    async getProductAddOns(productId: string) {
        return this.prismaService.productAddOn.findMany({
            where: {productId},
            include: {addOn: true}
        });
    }


}