import {PrismaService} from "../../../../prisma/prisma.service";
import {Utils} from "../../../Common/utils/utils";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ALREADY_EXIST} from "../../../../../constants/response.constant";

@Injectable()
export class SaucesService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly utils: Utils
    ) {
    }

    async createSauce(data: { name: string }) {
        const existingSauce = await this.prismaService.sauce.findFirst({
            where: {name: data.name}
        });

        if (existingSauce) {
            throw new HttpException({
                error: ALREADY_EXIST,
            }, HttpStatus.CONFLICT);
        }

        return this.prismaService.sauce.create({
            data
        });
    }

    async getSauces() {
        return this.prismaService.sauce.findMany({
            orderBy: {name: 'asc'}
        });
    }

    async getSauce(id: string) {
        return this.prismaService.sauce.findUnique({
            where: {id}
        });
    }

    async updateSauce(id: string, data: { name?: string }) {
        return this.prismaService.sauce.update({
            where: {id},
            data
        });
    }

    async deleteSauce(id: string) {
        return this.prismaService.sauce.delete({
            where: {id}
        });
    }

    async attachSaucesToProduct(productId: string, sauceIds: string[]) {
        // Remove existing sauces
        await this.prismaService.productSauce.deleteMany({
            where: {productId}
        });

        // Add new sauces
        const data = sauceIds.map(sauceId => ({
            productId,
            sauceId
        }));

        return this.prismaService.$transaction(
            data.map(item =>
                this.prismaService.productSauce.create({
                    data: item
                })
            )
        );
    }

    async getProductSauces(productId: string) {
        const data = await this.prismaService.productSauce.findMany({
            where: {productId},
            include: {sauce: true}
        });

        return {
            sauces: data.map(item => item.sauce)
        };
    }


}