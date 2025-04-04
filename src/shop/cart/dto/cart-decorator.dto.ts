import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsString, IsOptional} from "class-validator";

export class CartDecoratorDto {
    @ApiProperty({example: 'uuid', description: 'Product ID'})
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({example: 15, description: 'Number of product in the cart item'})
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({example: '#163546', description: 'Color of the product if it is to wear adn available'})
    @IsOptional()
    @IsString()
    color?: string;

    @ApiProperty({example: '#163546', description: 'Size of the product if it is to wear adn available'})
    @IsOptional()
    @IsString()
    size?: string;
}