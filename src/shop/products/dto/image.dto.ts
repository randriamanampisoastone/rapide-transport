import {ApiProperty} from "@nestjs/swagger";

export class ImageDto {
    @ApiProperty({type: 'string', format: 'binary'})
    file: any;

    @ApiProperty({example: true, required: false})
    isMain?: boolean;

    @ApiProperty({example: 'Product image alt text', required: false})
    alt?: string;
}