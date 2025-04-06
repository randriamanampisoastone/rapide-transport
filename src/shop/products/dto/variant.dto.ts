import {SizeType} from "../../../../enums/shop.enum";

type Variant = {
    color: string;
    size: SizeType;
    stock: number;
}

export type AddVariantDto = Required<Variant>
export type EditVariantDto = Partial<Variant>