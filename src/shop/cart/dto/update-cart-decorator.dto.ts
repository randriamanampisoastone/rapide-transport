import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class UpdateCartDecoratorDto {
    @ApiProperty({example: 'uuid', description: 'Id cart item ID'})
    @IsNotEmpty()
    @IsString()
    cartItemId: string;

    @ApiProperty({example: 15, description: 'Number of product in the cart item'})
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({example: 1500.00, description: 'Calculated price of the product in the cart item'})
    @IsNotEmpty()
    @IsNumber()
    calculatedPrice: number;
}