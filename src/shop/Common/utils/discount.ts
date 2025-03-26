import {Discount, DiscountType, Product, ProductDiscount} from '@prisma/client';
import {Decimal} from '@prisma/client/runtime/library';
import {PrismaService} from "../../../prisma/prisma.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class DiscountUtils {
    constructor(
        private readonly prismaService: PrismaService
    )
    {}

    calculateDiscountedPrice(
        product: Product & { discounts?: (ProductDiscount & { discount: Discount })[] },
    ): {
        originalPrice: Decimal,
        discountedPrice: Decimal,
        discount: Discount | null,
        discountAmount: Decimal,
        percentOff: number
    } {
        if (!product.discounts || product.discounts.length === 0) {
            return {
                originalPrice: product.price,
                discountedPrice: product.price,
                discount: null,
                discountAmount: new Decimal(0),
                percentOff: 0
            };
        }

        // Get active discounts
        const now = new Date();
        const activeDiscounts = product.discounts
            .map(pd => pd.discount)
            .filter(discount =>
                discount.active &&
                (!discount.startDate || discount.startDate <= now) &&
                (!discount.endDate || discount.endDate >= now) &&
                (!discount.maxUses || discount.currentUses < discount.maxUses)
            );

        if (activeDiscounts.length === 0) {
            return {
                originalPrice: product.price,
                discountedPrice: product.price,
                discount: null,
                discountAmount: new Decimal(0),
                percentOff: 0
            };
        }

        // Use the highest discount
        // You could implement different strategies here (e.g., combining discounts)
        let bestDiscount: Discount | null = null;
        let bestDiscountedPrice = product.price;
        let bestDiscountAmount = new Decimal(0);
        let bestPercentOff = 0;

        for (const discount of activeDiscounts) {
            let discountedPrice: Decimal;
            let discountAmount: Decimal;
            let percentOff: number;

            if (discount.type === DiscountType.PERCENTAGE) {
                discountAmount = product.price.mul(discount.value).div(100);
                discountedPrice = product.price.sub(discountAmount);
                percentOff = Number(discount.value);
            } else { // FIXED_AMOUNT
                discountAmount = discount.value;
                discountedPrice = product.price.sub(discountAmount);
                if (discountedPrice.lessThan(0)) {
                    discountedPrice = new Decimal(0);
                    discountAmount = product.price;
                }
                percentOff = Number(discountAmount.div(product.price).mul(100));
            }

            if (!bestDiscount || discountedPrice.lessThan(bestDiscountedPrice)) {
                bestDiscount = discount;
                bestDiscountedPrice = discountedPrice;
                bestDiscountAmount = discountAmount;
                bestPercentOff = percentOff;
            }
        }

        return {
            originalPrice: product.price,
            discountedPrice: bestDiscountedPrice,
            discount: bestDiscount,
            discountAmount: bestDiscountAmount,
            percentOff: bestPercentOff
        };
    }

// Function to check if a discount coupon is valid
    async validateCoupon(
        couponCode: string,
        productId: string
    ): Promise<Discount | null> {
        const now = new Date();

        return this.prismaService.discount.findFirst({
            where: {
                couponCode,
                active: true,
                startDate: {lte: now},
                endDate: {gte: now},
                OR: [
                    {maxUses: null},
                    {currentUses: {lt: this.prismaService.discount.fields.maxUses}}
                ],
                products: {
                    some: {productId}
                }
            }
        });
    }
}

