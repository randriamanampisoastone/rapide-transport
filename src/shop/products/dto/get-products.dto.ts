import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetProductsDto {
    @IsEnum(['MART', 'FOOD'])
    @IsOptional()
    productFor?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    itemsPerPage?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;

    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    categories?: string[];

    @IsString()
    @IsOptional()
    shop?: string;
}