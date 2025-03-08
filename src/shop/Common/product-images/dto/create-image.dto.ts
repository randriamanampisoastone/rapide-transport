import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
   @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL of the image' })
   @IsNotEmpty()
   @IsString()
   url: string;

   @ApiProperty({ example: 'An image of a product', description: 'Alternative text for the image', required: false })
   @IsOptional()
   @IsString()
   alt?: string;

   @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the associated product' })
   @IsNotEmpty()
   @IsUUID()
   productId: string;

   @ApiProperty({ example: false, description: 'Indicates if the image is the main image for the product', required: false })
   @IsOptional()
   @IsBoolean()
   isMain?: boolean;
}
