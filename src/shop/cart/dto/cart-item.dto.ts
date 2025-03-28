type CartItem = {
    productId: string,
    quantity: number,
}

export type AddCartItemDto = Required<CartItem>
export type EditCartItemDto = Partial<CartItem>