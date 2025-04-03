import { GenderType, UserRole } from "enums/profile.enum"

export interface SignUpDataOnRedisInterface {
   phoneNumber: string
   email?: string
   firstName: string
   lastName?: string
   gender: GenderType
   birthday: Date
   role: UserRole
   profilePhoto?: string
   locale: string
   attempt: number
   confirmationCode: string
}