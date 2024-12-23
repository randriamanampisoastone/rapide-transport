import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { CreateDriverProfileDto } from './dto/create-driver-profile.dto'
@Injectable()
export class CreateDriverProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async createDriverProfile(
      driverProfileId: string,
      email: string,
      createDriverProfileDto: CreateDriverProfileDto,
   ) {
      const { birthday, ...createDriverProfileDtoRest } = createDriverProfileDto

      try {
         const createdDriverProfile =
            await this.prismaService.driverProfile.create({
               data: {
                  driverProfileId,
                  email,
                  birthday: new Date(birthday),
                  ...createDriverProfileDtoRest,
               },
            })

         const createdAccountBalance =
            await this.prismaService.accountBalance.create({
               data: {
                  driverProfileId: createdDriverProfile.driverProfileId,
               },
            })

         return {
            driverProfile: createdDriverProfile,
            accountBalance: createdAccountBalance,
         }
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
