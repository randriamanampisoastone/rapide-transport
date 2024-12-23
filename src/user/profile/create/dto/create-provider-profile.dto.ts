import { EnterpriseType, Schedule } from '@prisma/client'
import { Type } from 'class-transformer'
import {
   IsArray,
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsString,
   IsUrl,
   ValidateNested,
} from 'class-validator'
import { CreateAddressDto } from 'src/user/address/dto/create-address.dto'

export class CreateProviderProfileDto {
   @IsNotEmpty({ message: 'Enterprise Name should not be empty' })
   @IsString({ message: 'Enterprise Name must be a string' })
   enterpriseName: string

   @IsEnum(EnterpriseType, { message: 'Invalid enterprise type' })
   enterpriseType: EnterpriseType

   @IsArray({ message: 'Enterprise Description must be an array of strings' })
   @IsString({
      each: true,
      message: 'Enterprise Description must be an array of strings',
   })
   enterpriseDescription: string[]

   @IsOptional()
   @IsUrl({}, { message: 'Enterprise Logo must be a valid URL' })
   enterpriseLogo?: string

   @IsUrl({}, { message: 'Enterprise Profile Photo must be a valid URL' })
   enterpriseProfilePhoto: string

   @IsArray({ message: 'Enterprise Photos must be an array of URLs' })
   @IsUrl(
      {},
      { each: true, message: 'Each enterprise photo must be a valid URL' },
   )
   enterprisePhotos: string[]

   @IsArray({ message: 'Client Address must be an array' })
   @ValidateNested({ each: true })
   @Type(() => CreateAddressDto)
   enterpriseAddress: CreateAddressDto[]

   @IsNotEmpty()
   schedule: Schedule
}
