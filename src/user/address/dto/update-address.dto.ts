import {
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
   Max,
   Min,
} from 'class-validator'

export class UpdateAddressDto {
   @IsOptional()
   @IsNotEmpty({ message: 'Name should not be empty' })
   @IsString({ message: 'Name must be a string' })
   name?: string

   @IsOptional()
   @IsNotEmpty({ message: 'City should not be empty' })
   @IsString({ message: 'City must be a string' })
   city?: string

   @IsOptional()
   @IsNotEmpty({ message: 'Country should not be empty' })
   @IsString({ message: 'Country must be a string' })
   country?: string

   @IsOptional()
   @IsNotEmpty({ message: 'Lot should not be empty' })
   @IsString({ message: 'Lot must be a string' })
   lot?: string

   @IsOptional()
   @IsNotEmpty({ message: 'Description should not be empty' })
   @IsString({ message: 'Description must be a string' })
   description?: string

   @IsOptional()
   @IsNumber({}, { message: 'Latitude must be a number' })
   @Min(-90, { message: 'Latitude must be greater than or equal to -90' })
   @Max(90, { message: 'Latitude must be less than or equal to 90' })
   latitude?: number

   @IsOptional()
   @IsNumber({}, { message: 'Longitude must be a number' })
   @Min(-180, { message: 'Longitude must be greater than or equal to -180' })
   @Max(180, { message: 'Longitude must be less than or equal to 180' })
   longitude?: number
}
