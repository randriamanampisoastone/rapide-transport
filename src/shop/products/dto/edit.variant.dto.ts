import {ApiProperty} from "@nestjs/swagger";

export class EditVariantDto {
    @ApiProperty({example: '#123548', required: false})
    color?: string;

    @ApiProperty({example: 'L', required: false})
    size?: string;

    @ApiProperty({example: 5, required: false})
    stock?: number;
}