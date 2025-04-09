import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class AppleAuthDto {
   @IsString()
   @IsNotEmpty()
   idToken: string

   @IsNotEmpty()
   @IsIn(['fr', 'mg', 'en', 'zh'], {
      message: 'Locale must be one of the following: fr, mg, en, zh',
   })
   locale: string

   @IsOptional()
   firstName: string

   @IsOptional()
   lastName: string
}
