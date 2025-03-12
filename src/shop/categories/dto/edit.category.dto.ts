import {IsEnum, IsOptional, IsString} from "class-validator";
import {CategoryTypeFor} from "../../../../enums/shop.enum";


export class EditCategoryDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsEnum(CategoryTypeFor, {
        message:
            'For value mus ton of: MART, FOOD',
    })
    for?: CategoryTypeFor

    @IsOptional()
    @IsString()
    icon?: string
}