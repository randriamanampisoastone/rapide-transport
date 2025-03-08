import {IsNotEmpty, IsString, IsUUID, IsEnum, IsNumber, IsOptional} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {OrderStatus} from '@prisma/client';

export class CreateOrderDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID of the user placing the order'
    }) @IsNotEmpty() @IsUUID() userId: string;
    @ApiProperty({enum: OrderStatus, example: 'PENDING', description: 'Status of the order', required: false})
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiProperty({example: 99.99, description: 'Total price of the order'})
    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;
}