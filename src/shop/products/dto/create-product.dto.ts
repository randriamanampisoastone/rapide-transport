import {
    IsArray,
    IsBoolean,
    IsDecimal,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {string} from "joi";
import {ImageDto} from "./image.dto";

export class CreateProductDto {
    @ApiProperty({example: 'iPhone 13', description: 'The name of the product'})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Latest iPhone model with A15 bionic chip',
        description: 'Detailed description of the product'
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({example: 999.99, description: 'Product price'})
    @IsNotEmpty()
    @IsDecimal()
    price: number;

    @ApiProperty({example: 100, description: 'Available inventory quantity'})
    @IsNotEmpty()
    @IsNumber()
    inventory: number;

    @ApiProperty({example: true, description: 'Is active if product is clothing'})
    @IsOptional()
    @IsBoolean()
    isClothes: boolean;

    @ApiProperty({example: 'Blue', description: 'Color of the cloths'})
    @IsOptional()
    @IsString()
    color?: string;

    @ApiProperty({example: 'XL', description: 'Size of the cloths'})
    @IsOptional()
    @IsString()
    size?: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                file: {type: 'string', format: 'binary'},
                isMain: {type: 'boolean'},
                alt: {type: 'string'}
            }
        },
        description: 'Array of product images',
        required: false
    })
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ImageDto)
    images?: ImageDto[];

    @ApiProperty({
        type: [string],
        description: 'Array of product category',
        required: false
    })
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => string)
    categories?: string[];
}