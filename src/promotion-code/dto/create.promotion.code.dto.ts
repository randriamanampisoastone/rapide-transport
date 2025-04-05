import { Services, VehicleType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
   IsArray,
   IsDate,
   IsEnum,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
   IsUppercase,
   ValidateNested,
} from 'class-validator'

export class PromotionServicesDto {
   @IsNotEmpty()
   @IsEnum(Services)
   serviceFor: Services

   @IsEnum(VehicleType)
   @IsOptional()
   vehicleType?: VehicleType

   @IsNotEmpty()
   @IsNumber()
   value: number
}

export class CreatePromotionCodeDto {
   @IsString()
   @IsNotEmpty()
   @IsUppercase()
   code: string

   @IsOptional()
   @Type(() => Date)
   @IsDate({
      message: 'startAt must be a valid date in the format YYYY-MM-DD',
   })
   startAt?: Date

   @IsNotEmpty()
   @Type(() => Date)
   @IsDate({
      message: 'expiredAt must be a valid date in the format YYYY-MM-DD',
   })
   expiredAt: Date

   @IsString()
   @IsOptional()
   customMessage?: string

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => PromotionServicesDto)
   promotionServices: PromotionServicesDto[]
}
