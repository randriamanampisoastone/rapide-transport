import { IsNumber, IsOptional, IsString } from 'class-validator'

export class updateHomeDto {
   @IsString()
   name?: string

   @IsNumber()
   @IsOptional()
   latitude?: number

   @IsNumber()
   @IsOptional()
   longitude?: number

   @IsString()
   @IsOptional()
   phoneNumber?: string

   @IsNumber()
   @IsOptional()
   carCount?: number

   @IsNumber()
   @IsOptional()
   motoCount?: number
}
