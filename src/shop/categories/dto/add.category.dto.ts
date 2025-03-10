import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {Optional} from "@nestjs/common";
import {CategoryTypeFor} from "../../../../enums/shop.enum";


export class AddCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @Optional()
    @IsString()
    description?: string

    @IsEnum(CategoryTypeFor, {
        message:
            'For value mus ton of: MART, FOOD',
    })
    for: CategoryTypeFor

    @IsNotEmpty()
    @IsString()
    icon: string
}