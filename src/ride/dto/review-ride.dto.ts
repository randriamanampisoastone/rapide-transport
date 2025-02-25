import {
   IsNumber,
   IsOptional,
   IsPositive,
   IsString,
   Max,
} from 'class-validator'

export class ReviewRideDto {
   @IsOptional()
   @IsString()
   review?: string

   @IsOptional()
   @IsNumber({ allowInfinity: false })
   @IsPositive()
   @Max(5)
   note?: number
}
