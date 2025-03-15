import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

enum RequestFor {
   RIDE = 'RIDE',
   FOOD = 'FOOD',
   MART = 'MART',
   EXPRESS = 'EXPRESS',
}

export class SendClientRequestDto {
   @IsString()
   @IsNotEmpty()
   message: string

   @IsEnum(RequestFor)
   @IsNotEmpty()
   requestFor: RequestFor
}
