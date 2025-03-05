import { IsNotEmpty, IsString } from "class-validator";

export class AnswerClientRequestDto {
    @IsString()
    @IsNotEmpty()
    message: string
}