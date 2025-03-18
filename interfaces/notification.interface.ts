import { UserRole } from 'enums/profile.enum'

export interface NotificationInterface {
   userProfileId: string
   expoPushToken?: string
   role: UserRole.CLIENT
}
