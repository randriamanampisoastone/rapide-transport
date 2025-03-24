import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateReviewDto {

    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({example: '3.5', description: 'Rate of the product'})
    @IsNotEmpty()
    @IsNumber()
    rating: string;

    @ApiProperty({example: 'Product very interesting', description: 'Comment of the rate'})
    @IsOptional()
    @IsString()
    comment: string;
}
