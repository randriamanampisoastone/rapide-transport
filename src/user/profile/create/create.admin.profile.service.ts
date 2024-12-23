import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { CreateAdminProfileDto } from './dto/create-admin-profile.dto'
@Injectable()
export class CreateAdminProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async createAdminProfile(
      adminProfileId: string,
      email: string,
      createAdminProfileDto: CreateAdminProfileDto,
   ) {
      try {
         const createdAdminProfile =
            await this.prismaService.adminProfile.create({
               data: { adminProfileId, email, ...createAdminProfileDto },
            })

         return {
            adminProfile: createdAdminProfile,
         }
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
