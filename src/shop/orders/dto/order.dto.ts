import {OrderStatus} from '@prisma/client';

type Order = {
    userId: string;
    status: OrderStatus;
    totalPrice: number;
}

export type AddOrderDto = Required<Order>;
export type EditOrderDto = Partial<Order>;