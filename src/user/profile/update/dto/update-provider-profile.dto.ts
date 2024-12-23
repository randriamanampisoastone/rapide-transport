import { EnterpriseType } from '@prisma/client'
import { IsArray, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator'

export class UpdateProviderProfileDto {
   @IsOptional()
   @IsString({ message: 'Enterprise Name must be a string' })
   enterpriseName?: string

   @IsOptional()
   @IsEnum(EnterpriseType, { message: 'Invalid enterprise type' })
   enterpriseType?: EnterpriseType

   @IsOptional()
   @IsArray({ message: 'Enterprise Description must be an array of strings' })
   @IsString({
      each: true,
      message: 'Enterprise Description must be an array of strings',
   })
   enterpriseDescription?: string[]

   @IsOptional()
   @IsUrl({}, { message: 'Enterprise Logo must be a valid URL' })
   enterpriseLogo?: string

   @IsOptional()
   @IsUrl({}, { message: 'Enterprise Profile Photo must be a valid URL' })
   enterpriseProfilePhoto?: string

   @IsOptional()
   @IsArray({ message: 'Enterprise Photos must be an array of URLs' })
   @IsUrl(
      {},
      { each: true, message: 'Each enterprise photo must be a valid URL' },
   )
   enterprisePhotos?: string[]
}
