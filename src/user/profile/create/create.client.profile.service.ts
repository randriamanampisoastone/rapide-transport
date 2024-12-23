import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { CreateClientProfileDto } from './dto/create-client-profile.dto'
@Injectable()
export class CreateClientProfileService {
   constructor(private readonly prismaService: PrismaService) {}

   async createClientProfile(
      clientProfileId: string,
      email: string,
      createClientProfileDto: CreateClientProfileDto,
   ) {
      const { birthday, ...createClientProfileDtoRest } = createClientProfileDto

      try {
         const createdClientProfile =
            await this.prismaService.clientProfile.create({
               data: {
                  email,
                  clientProfileId,
                  birthday: new Date(birthday),
                  ...createClientProfileDtoRest,
               },
            })

         await this.prismaService.accountBalance.create({
            data: {
               clientProfileId: createdClientProfile.clientProfileId,
            },
         })

         await this.prismaService.foodCart.create({
            data: {
               clientProfileId: createdClientProfile.clientProfileId,
            },
         })

         await this.prismaService.martCart.create({
            data: {
               clientProfileId: createdClientProfile.clientProfileId,
            },
         })

         await this.prismaService.favorite.create({
            data: {
               clientProfileId: createdClientProfile.clientProfileId,
            },
         })

         return createdClientProfile
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
