import {IsEnum, IsOptional, IsString} from "class-validator";
import {CategoryTypeFor} from "../../../../enums/shop.enum";
import {ApiProperty} from "@nestjs/swagger";


export class EditCategoryDto {
    @ApiProperty({ required: false, description: 'Category name', example: 'Exotic fruits' })
    @IsOptional()
    @IsString()
    name?: string

    @ApiProperty({ required: false, description: 'Category description', example: 'Exotic fruits seen in paradisaical areas' })
    @IsOptional()
    @IsString()
    description?: string

    @ApiProperty({ required: false, description: 'Category type', enum: CategoryTypeFor })
    @IsOptional()
    @IsEnum(CategoryTypeFor, {
        message:
            'For value mus ton of: MART, FOOD',
    })
    for?: CategoryTypeFor

    @ApiProperty({ required: false, description: 'Category icon', example: 'fas fa-apple' })
    @IsOptional()
    @IsString()
    icon?: string
}