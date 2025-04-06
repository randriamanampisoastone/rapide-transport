import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {SizeType} from "../../../../enums/shop.enum";

export class GetProductsDto {
    @ApiProperty({ required: false, enum: ['MART', 'FOOD'] })
    @IsEnum(['MART', 'FOOD'])
    @IsOptional()
    productFor?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    itemsPerPage?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiProperty({ required: false, enum: SizeType })
    @IsEnum(SizeType)
    @IsOptional()
    size?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    categories?: string[];

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    shop?: string;
}