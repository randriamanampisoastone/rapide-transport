import { UserRole } from '@prisma/client'

export interface TransferRedisDataInterface {
   from: string
   to: string
   receiverRapideWalletId: string
   senderRapideWalletId: string
   receiverRole: UserRole
   amount: number
   code: string
   attempt: number
}
