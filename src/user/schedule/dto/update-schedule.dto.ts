import {
   IsBoolean,
   IsOptional,
   IsString,
   Matches,
   ValidateIf,
} from 'class-validator'

export class UpdateScheduleDto {
   @IsOptional()
   @IsBoolean({ message: 'MondayIsOpen must be a boolean' })
   mondayIsOpen?: boolean

   @ValidateIf((o) => o.mondayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'MondayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'MondayOpenAt must be in HH:mm format',
   })
   mondayOpenAt?: string

   @ValidateIf((o) => o.mondayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'MondayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'MondayCloseAt must be in HH:mm format',
   })
   mondayCloseAt?: string

   @IsOptional()
   @IsBoolean({ message: 'TuesdayIsOpen must be a boolean' })
   tuesdayIsOpen?: boolean

   @ValidateIf((o) => o.tuesdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'TuesdayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'TuesdayOpenAt must be in HH:mm format',
   })
   tuesdayOpenAt?: string

   @ValidateIf((o) => o.tuesdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'TuesdayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'TuesdayCloseAt must be in HH:mm format',
   })
   tuesdayCloseAt?: string

   @IsOptional()
   @IsBoolean({ message: 'WednesdayIsOpen must be a boolean' })
   wednesdayIsOpen?: boolean

   @ValidateIf((o) => o.wednesdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'WednesdayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'WednesdayOpenAt must be in HH:mm format',
   })
   wednesdayOpenAt?: string

   @ValidateIf((o) => o.wednesdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'WednesdayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'WednesdayCloseAt must be in HH:mm format',
   })
   wednesdayCloseAt?: string

   @IsOptional()
   @IsBoolean({ message: 'ThursdayIsOpen must be a boolean' })
   thursdayIsOpen?: boolean

   @ValidateIf((o) => o.thursdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'ThursdayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'ThursdayOpenAt must be in HH:mm format',
   })
   thursdayOpenAt?: string

   @ValidateIf((o) => o.thursdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'ThursdayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'ThursdayCloseAt must be in HH:mm format',
   })
   thursdayCloseAt?: string

   @IsOptional()
   @IsBoolean({ message: 'FridayIsOpen must be a boolean' })
   fridayIsOpen?: boolean

   @ValidateIf((o) => o.fridayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'FridayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'FridayOpenAt must be in HH:mm format',
   })
   fridayOpenAt?: string

   @ValidateIf((o) => o.fridayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'FridayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'FridayCloseAt must be in HH:mm format',
   })
   fridayCloseAt?: string

   @IsOptional()
   @IsBoolean({ message: 'SaturdayIsOpen must be a boolean' })
   saturdayIsOpen?: boolean

   @ValidateIf((o) => o.saturdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'SaturdayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'SaturdayOpenAt must be in HH:mm format',
   })
   saturdayOpenAt?: string

   @ValidateIf((o) => o.saturdayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'SaturdayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'SaturdayCloseAt must be in HH:mm format',
   })
   saturdayCloseAt?: string

   @IsOptional()
   @IsBoolean({ message: 'SundayIsOpen must be a boolean' })
   sundayIsOpen?: boolean

   @ValidateIf((o) => o.sundayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'SundayOpenAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'SundayOpenAt must be in HH:mm format',
   })
   sundayOpenAt?: string

   @ValidateIf((o) => o.sundayIsOpen === true)
   @IsOptional()
   @IsString({ message: 'SundayCloseAt must be a string' })
   @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: 'SundayCloseAt must be in HH:mm format',
   })
   sundayCloseAt?: string
}
