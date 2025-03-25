import {DiscountType} from "@prisma/client";

type Discount = {
    name: string,
    description: string,
    type: DiscountType,
    value: number,
    startDate: string,
    endDate: string,
    active: boolean,
    minPurchaseAmount: number,
    maxUses: number,
    couponCode: string,
    products: string[],
}

export type AddDiscountDTO = Required<Discount>;

export type UpdateDiscountDTO = Partial<Discount>;