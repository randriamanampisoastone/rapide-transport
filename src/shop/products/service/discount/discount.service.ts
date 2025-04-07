import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "../../../../prisma/prisma.service";
import {AddDiscountDTO} from "../../dto/discount.dto";
import {MIN_AMOUNT_PURCHASED} from "../../../../../constants/discount.constant";
import {Decimal} from "@prisma/client/runtime/library";
import {ERROR_FETCHING_PRODUCT} from "../../../../../constants/response.constant";

@Injectable()
export class DiscountService {
    constructor(
        private readonly prismaService: PrismaService
    ) {
    }


    async createDiscount(data: AddDiscountDTO) {
        const dataTransformed: any = {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            minPurchaseAmount: data.minPurchaseAmount ? new Decimal(data.minPurchaseAmount) : MIN_AMOUNT_PURCHASED,
            products: {
                create: data.products.map((productId: string) => ({
                    product: {connect: {id: productId}}
                }))
            }
        };
        
        return this.prismaService.discount.create({
            data: dataTransformed
        });
    }

}