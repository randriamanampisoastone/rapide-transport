import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum} from "class-validator";
import {SizeType} from "../../../../enums/shop.enum";

export class CartDecoratorDto {
    @ApiProperty({example: 'uuid', description: 'Product ID'})
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({example: 15, description: 'Number of product in the cart item'})
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({example: 1500.00, description: 'Calculated price of the product in the cart item'})
    @IsNotEmpty()
    @IsNumber()
    calculatedPrice: number;

    @ApiProperty({enum: SizeType, example: 'XL', description: 'Color of the product if it is to wear adn available'})
    @IsEnum(SizeType)
    @IsString()
    size?: SizeType;

    @ApiProperty({example: 'Red', description: 'Size of the product if it is to wear adn available'})
    @IsOptional()
    @IsString()
    color?: string;
}