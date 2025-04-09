import {HttpException, HttpStatus} from "@nestjs/common";
import {NOT_OWNER_OF_THE_PRODUCT} from "../../../../constants/response.constant";
import {PrismaService} from "../../../prisma/prisma.service";

export class Utils {

    constructor(private readonly prismaService: PrismaService) {}

    async checkProductOwner(id: string, userId: string){
        const product = await this.prismaService.product.findUnique({
            where: {id: id}
        });
        if (product.sellerId !== userId) {
            throw new HttpException({
                error: NOT_OWNER_OF_THE_PRODUCT
            }, HttpStatus.BAD_REQUEST);
        }
    }
}