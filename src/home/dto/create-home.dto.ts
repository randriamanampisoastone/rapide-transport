import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateHomeDto {
   @IsString()
   name: string

   @IsNumber()
   @IsNotEmpty()
   latitude: number

   @IsNumber()
   @IsNotEmpty()
   longitude: number
}
