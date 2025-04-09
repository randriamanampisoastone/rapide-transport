import { Services } from '@prisma/client'
import {
   IsEnum,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
} from 'class-validator'
import { VehicleType } from 'enums/vehicle.enum'

export class UpdatePromotionServicesDto {
   @IsNotEmpty()
   @IsString()
   promotionServiceId: string

   @IsOptional()
   @IsEnum(Services)
   serviceFor?: Services

   @IsEnum(VehicleType)
   @IsOptional()
   vehicleType?: VehicleType

   @IsOptional()
   @IsNumber()
   value?: number
}
