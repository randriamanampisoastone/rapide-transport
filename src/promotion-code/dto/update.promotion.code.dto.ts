import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUppercase } from 'class-validator'

export class UpdatePromotionCodeDto {
   @IsString()
   @IsNotEmpty()
   promotionCodeId: string

   @IsString()
   @IsOptional()
   @IsUppercase()
   code?: string

   @IsOptional()
   @Type(() => Date)
   @IsDate({
      message: 'startAt must be a valid date in the format YYYY-MM-DD',
   })
   startAt?: Date

   @IsOptional()
   @Type(() => Date)
   @IsDate({
      message: 'expiredAt must be a valid date in the format YYYY-MM-DD',
   })
   expiredAt?: Date

   @IsString()
   @IsOptional()
   customMessage?: string
}
