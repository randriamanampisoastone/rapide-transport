import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto'
import { PostgresError } from 'errors/postgres.error'

@Injectable()
export class CreateProviderProfileService {
   constructor(private readonly prismaService: PrismaService) {}
   async createProviderProfile(
      providerProfileId: string,
      email: string,
      createProviderProfileDto: CreateProviderProfileDto,
   ) {
      const { enterpriseAddress, schedule, ...createProviderProfileDtoRest } =
         createProviderProfileDto

      try {
         const createdSchedule = await this.prismaService.schedule.create({
            data: {
               mondayIsOpen: schedule.mondayIsOpen || false,
               mondayOpenAt: schedule.mondayOpenAt,
               mondayCloseAt: schedule.mondayCloseAt,
               tuesdayIsOpen: schedule.tuesdayIsOpen || false,
               tuesdayOpenAt: schedule.tuesdayOpenAt,
               tuesdayCloseAt: schedule.tuesdayCloseAt,
               wendnesdayIsOpen: schedule.wendnesdayIsOpen || false,
               wendnesdayOpenAt: schedule.wendnesdayOpenAt,
               wendnesdayCloseAt: schedule.wendnesdayCloseAt,
               thursdayIsOpen: schedule.thursdayIsOpen || false,
               thursdayOpenAt: schedule.thursdayOpenAt,
               thursdayCloseAt: schedule.thursdayCloseAt,
               fridayIsOpen: schedule.fridayIsOpen || false,
               fridayOpenAt: schedule.fridayOpenAt,
               fridayCloseAt: schedule.fridayCloseAt,
               saturdayIsOpen: schedule.saturdayIsOpen || false,
               saturdayOpenAt: schedule.saturdayOpenAt,
               saturdayCloseAt: schedule.saturdayCloseAt,
               sundayIsOpen: schedule.sundayIsOpen || false,
               sundayOpenAt: schedule.sundayOpenAt,
               sundayCloseAt: schedule.sundayCloseAt,
            },
         })

         const createdProviderProfile =
            await this.prismaService.providerProfile.create({
               data: {
                  email,
                  providerProfileId,
                  schedule: {
                     connect: { scheduleId: createdSchedule.scheduleId },
                  },
                  ...createProviderProfileDtoRest,
               },
            })

         const createdAddresses = await Promise.all(
            enterpriseAddress.map(async (address) => {
               return this.prismaService.address.create({
                  data: {
                     name: address.name,
                     city: address.city,
                     country: address.country || 'Madagascar',
                     latitude: address.latitude,
                     longitude: address.longitude,
                     lot: address.lot,
                     providerProfileId:
                        createdProviderProfile.providerProfileId,
                  },
               })
            }),
         )

         const createdAccountBalance =
            await this.prismaService.accountBalance.create({
               data: {
                  providerProfileId: createdProviderProfile.providerProfileId,
               },
            })

         return {
            providerProfile: createdProviderProfile,
            providerAddress: createdAddresses,
            accountBalance: createdAccountBalance,
         }
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
