import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {Optional} from "@nestjs/common";
import {CategoryTypeFor} from "../../../../enums/shop.enum";
import {ApiProperty} from "@nestjs/swagger";


export class AddCategoryDto {
    @ApiProperty({ required: true, description: 'Category name', example: 'Exotic fruits' })
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({ required: false, description: 'Category description', example: 'Exotic fruits seen in paradisaical areas' })
    @Optional()
    @IsString()
    description?: string

    @ApiProperty({ required: true, description: 'Category type', enum: CategoryTypeFor })
    @IsNotEmpty()
    @IsEnum(CategoryTypeFor, {
        message:
            'For value mus ton of: MART, FOOD',
    })
    for: CategoryTypeFor

    @ApiProperty({ required: true, description: 'Category icon', example: 'fas fa-apple' })
    @IsNotEmpty()
    @IsString()
    icon: string
}