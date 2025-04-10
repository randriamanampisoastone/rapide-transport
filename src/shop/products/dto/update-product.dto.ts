import {IsArray, IsBoolean, IsDecimal, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {string} from "joi";
import {ImageDto} from "./image.dto";

export class UpdateProductDto {
    @ApiProperty({example: 'iPhone 13', description: 'The name of the product'})
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Latest iPhone model with A15 bionic chip',
        description: 'Detailed description of the product'
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({example: 999.99, description: 'Product price'})
    @IsOptional()
    @IsDecimal()
    price: number;

    @ApiProperty({example: 100, description: 'Available inventory quantity'})
    @IsOptional()
    @IsNumber()
    inventory: number;

    @ApiProperty({example: true, description: 'Is active if product is to wear like shoes, etc.'})
    @IsOptional()
    @IsBoolean()
    toWear: boolean;

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
    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ImageDto)
    images?: ImageDto[];

    @ApiProperty({
        type: [string],
        description: 'Array of product category',
        required: false
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => string)
    categories?: string[];

    @ApiProperty({
        type: [String],
        description: 'Array of ingredients of product',
        required: false
    })
    @IsArray()
    @IsString({each: true})
    ingredients?: string[];

    @ApiProperty({
        type: [String],
        description: 'Array of sauces of product',
        required: false
    })
    @IsArray()
    @IsString({each: true})
    sauces?: string[];

    @ApiProperty({
        type: [String],
        description: 'Array of addons of product',
        required: false
    })
    @IsArray()
    @IsString({each: true})
    extras?: string[];

    @ApiProperty({
        type: [String],
        description: 'Array of drinks of product',
        required: false
    })
    @IsArray()
    @IsString({each: true})
    drinks?: string[];
}