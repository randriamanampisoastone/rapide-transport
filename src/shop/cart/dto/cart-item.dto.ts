type CartItem = {
    productId: string,
    quantity: number,
    calculatedPrice: number,
    color?: string,
    size?: string,
    cartItemId: string,
}

export type AddCartItemDto = Required<Omit<CartItem, 'cartItemId'>> & Pick<CartItem, 'cartItemId'>;
export type UpdateCartItemDto = Partial<CartItem>;