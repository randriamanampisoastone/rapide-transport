type CartItem = {
    productId: string,
    quantity: number,
    calculatedPrice: number,
    color?: string,
    size?: string,
    sauces?: string[],
    extras?: string[],
    drinks?: string[],
    cartItemId: string,
}

export type AddCartItemDto = Required<Omit<CartItem, 'cartItemId'>> & Pick<CartItem, 'cartItemId'>;
export type UpdateCartItemDto = Partial<CartItem>;