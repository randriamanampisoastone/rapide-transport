// src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsDecimal, IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {CreateImageDto} from "../../Common/product-images/dto/create-image.dto";

export class CreateProductDto {
   @ApiProperty({ example: 'iPhone 13', description: 'The name of the product' })
   @IsNotEmpty()
   @IsString()
   name: string;

   @ApiProperty({ example: 'Latest iPhone model with A15 bionic chip', description: 'Detailed description of the product' })
   @IsNotEmpty()
   @IsString()
   description: string;

   @ApiProperty({ example: 999.99, description: 'Product price' })
   @IsNotEmpty()
   @IsDecimal()
   price: number;

   @ApiProperty({ example: 100, description: 'Available inventory quantity' })
   @IsNotEmpty()
   @IsNumber()
   inventory: number;

   @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the product category' })
   @IsNotEmpty()
   @IsUUID()
   categoryId: string;

   @ApiProperty({
      type: [CreateImageDto],
      description: 'Array of product images',
      required: false
   })
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => CreateImageDto)
   @IsOptional()
   images?: CreateImageDto[];
}