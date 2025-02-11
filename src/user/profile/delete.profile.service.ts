import { Injectable } from '@nestjs/common'
import { UserRole } from 'enums/profile.enum'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class DeleteProfileService {
   constructor(private readonly prismaSservice: PrismaService) {}

   async deleteClientProfile(sub: string) {
      try {
         await this.prismaSservice.profile.delete({
            where: {
               sub,
               role: { in: [UserRole.CLIENT, UserRole.DRIVER] },
            },
         })
      } catch (error) {
         throw error
      }
   }
}
