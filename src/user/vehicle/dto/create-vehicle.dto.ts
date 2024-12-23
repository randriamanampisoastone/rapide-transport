import { VehicleRole } from '@prisma/client'
import {
   IsArray,
   IsEnum,
   IsInt,
   IsNotEmpty,
   IsOptional,
   IsString,
   Max,
   Min,
   Matches,
} from 'class-validator'

export class CreateVehicleDto {
   @IsNotEmpty({ message: 'Vehicle Model should not be empty' })
   @IsString({ message: 'Vehicle Model must be a string' })
   vehicleModel: string

   @IsNotEmpty({ message: 'Vehicle Type should not be empty' })
   @IsString({ message: 'Vehicle Type must be a string' })
   vehicleType: string

   @IsNotEmpty({ message: 'Vehicle Marque should not be empty' })
   @IsString({ message: 'Vehicle Marque must be a string' })
   vehicleMarque: string

   @IsNotEmpty({ message: 'Vehicle Place should not be empty' })
   @IsInt({ message: 'Vehicle Place must be an integer' })
   @Min(1, { message: 'Vehicle Place must be at least 1' })
   @Max(100, { message: 'Vehicle Place must not exceed 100' })
   vehiclePlace: number

   @IsOptional()
   @IsString({ message: 'Vehicle Registration Number must be a string' })
   @Matches(/^[A-Z0-9-]*$/, {
      message:
         'Vehicle Number must contain only uppercase letters, numbers, and hyphens',
   })
   vehicleRegistrationNumber?: string

   @IsNotEmpty({ message: 'Vehicle Photos should not be empty' })
   @IsArray({ message: 'Vehicle Photos must be an array' })
   @IsString({ each: true, message: 'Each Vehicle Photo must be a string' })
   vehiclePhotos: string[]

   @IsNotEmpty({ message: 'Vehicle Role should not be empty' })
   @IsEnum(VehicleRole, {
      message: 'Vehicle Role must be one of DRIVER, OWNER, PASSENGER',
   })
   role: VehicleRole
}
