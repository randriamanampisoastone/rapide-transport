import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsString} from "class-validator";

export class AddVariantDto {
    @ApiProperty({example: '#123548', required: true})
    @IsString()
    color: string;

    @ApiProperty({example: 'L', required: true})
    @IsString()
    size: string;

    @ApiProperty({example: 5, required: true})
    @IsNumber()
    stock: number;
}