import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateHomeDto {
   @IsString()
   name: string

   @IsNumber()
   @IsNotEmpty()
   latitude: number

   @IsNumber()
   @IsNotEmpty()
   longitude: number

   @IsString()
   @IsOptional()
   phoneNumber?: string
}
