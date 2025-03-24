type Variant = {
    color: string;
    size: string;
    stock: number;
}

export type AddVariantDto = Required<Variant>
export type EditVariantDto = Partial<Variant>