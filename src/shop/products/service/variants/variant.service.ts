import {PrismaService} from "../../../../prisma/prisma.service";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {AddVariantDto, EditVariantDto} from "../../dto/variant.dto";
import {ALREADY_EXIST} from "../../../../../constants/response.constant";
import {Utils} from "../../../Common/utils/utils";

@Injectable()
export class VariantService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly utils: Utils
    ) {
    }

    async createVariant(userId: string, id: string, data: AddVariantDto) {
        await this.utils.checkProductOwner(id, userId);
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
        await this.utils.checkProductOwner(id, userId);
        return this.prismaService.productVariant.update({
            where: {id: id},
            data: data
        });
    }
}