import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
   constructor(private readonly prismaService: PrismaService) {}

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

   async changeClientPassword(
      clientProfileId: string,
      oldPassword: string,
      newPassword: string,
   ) {
      try {
         await this.prismaService.$transaction(async (prisma) => {
            const clientProfile = await prisma.rapideWallet.findUnique({
               where: { clientProfileId },
               select: { password: true },
            })

            const isMatch = await bcrypt.compare(
               oldPassword,
               clientProfile.password,
            )
            if (!isMatch) {
               throw new BadRequestException('incorrect password')
            }

            const salt = await bcrypt.genSalt(10, 'a')
            const hashedPassword = await bcrypt.hash(newPassword, salt)

            await prisma.rapideWallet.update({
               where: { clientProfileId },
               data: { password: hashedPassword },
            })
         })
      } catch (error) {
         throw error
      }
   }
}
