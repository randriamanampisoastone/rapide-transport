import { UserRole } from 'enums/profile.enum'

export interface SignInDataOnRedisInterface {
   phoneNumber: string
   role: UserRole
   locale: string
   attempt: number
   confirmationCode: string
}
