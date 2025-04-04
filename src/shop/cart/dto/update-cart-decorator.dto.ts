import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class UpdateCartDecoratorDto {
    @ApiProperty({example: 'uuid', description: 'Id cart item ID'})
    @IsNotEmpty()
    @IsString()
    cartIemId: string;

    @ApiProperty({example: 15, description: 'Number of product in the cart item'})
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}