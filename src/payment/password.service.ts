import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
   constructor(private readonly prismaService: PrismaService) {}

   async setClientPassword(clientProfileId: string, password: string) {
      try {
         const salt = await bcrypt.genSalt(10, 'a')
         const hashedPassword = await bcrypt.hash(password, salt)
         await this.prismaService.clientProfile.update({
            where: { clientProfileId },
            data: { walletPassword: hashedPassword },
         })
      } catch (error) {
         throw error
      }
   }

   async setAdminPassword(adminProfileId: string, password: string) {
      try {
         const salt = await bcrypt.genSalt(10, 'a')
         const hashedPassword = await bcrypt.hash(password, salt)
         await this.prismaService.adminProfile.update({
            where: { adminProfileId },
            data: { transactionPassword: hashedPassword },
         })
      } catch (error) {
         throw error
      }
   }
}
