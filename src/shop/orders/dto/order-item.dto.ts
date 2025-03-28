type OrderItem = {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
}

export type AddOrderItemDto = Required<OrderItem>;
export type EditOrderItemDto = Partial<OrderItem>;