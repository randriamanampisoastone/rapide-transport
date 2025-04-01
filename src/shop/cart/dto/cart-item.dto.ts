type CartItem = {
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
}

export type AddCartItemDto = Required<CartItem>
export type EditCartItemDto = Partial<CartItem>