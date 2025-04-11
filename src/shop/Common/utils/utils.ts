import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PRODUCT_NOT_FOUND, UNAUTHORIZED_ACCESS } from '../../../../constants/response.constant';

@Injectable()
export class Utils {
    constructor(private readonly prismaService: PrismaService) {}

    async checkProductOwner(productId: string, userId: string): Promise<void> {
        const product = await this.prismaService.product.findUnique({
            where: { id: productId },
            select: { sellerId: true }
        });

        if (!product) {
            throw new HttpException({
                message: PRODUCT_NOT_FOUND,
                error: 'Not Found'
            }, HttpStatus.NOT_FOUND);
        }

        if (product.sellerId !== userId) {
            throw new HttpException({
                message: UNAUTHORIZED_ACCESS,
                error: 'Unauthorized'
            }, HttpStatus.UNAUTHORIZED);
        }
    }
}