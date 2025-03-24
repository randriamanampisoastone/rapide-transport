import {PrismaService} from "../../../../prisma/prisma.service";
import {AddVariantDto} from "../../dto/add.variant.dto";
import {EditVariantDto} from "../../dto/edit.variant.dto";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {
    ALREADY_EXIST,
    NOT_OWNER_OF_THE_PRODUCT
} from "../../../../../constants/response.constant";

@Injectable()
export class VariantService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async createVariant(userId: string, id: string, data: AddVariantDto) {
        await this.checkProductOwner(id, userId);
        const variant = await this.prismaService.productVariant.findUnique({
            where: {
                productId_color_size: {
                    productId: id,
                    color: data.color,
                    size: data.size
                }
            }
        });
        if (variant) {
            throw new HttpException({
                error: ALREADY_EXIST
            }, HttpStatus.BAD_REQUEST);
        }
        return this.prismaService.productVariant.create({
            data: {
                productId: id,
                color: data.color,
                size: data.size,
                stock: data.stock
            }
        });
    }

    async updateVariant(userId: string, id: string, data: EditVariantDto) {
        await this.checkProductOwner(id, userId);
        return this.prismaService.productVariant.update({
            where: {id: id},
            data: data
        });
    }

    private async checkProductOwner(id: string, userId: string){
        const product = await this.prismaService.product.findUnique({
            where: {id: id}
        });
        if (product.sellerId !== userId) {
            throw new HttpException({
                error: NOT_OWNER_OF_THE_PRODUCT
            }, HttpStatus.BAD_REQUEST);
        };
    }
}