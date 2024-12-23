import {
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/update-address.dto'
import { Address } from '@prisma/client'

@Injectable()
export class AddressService {
   constructor(private readonly prismaService: PrismaService) {}

   async createAddress(
      sub: string,
      role: string,
      createAddressDto: CreateAddressDto,
   ) {
      try {
         switch (role) {
            case 'ClientGroup':
               return await this.prismaService.address.create({
                  data: { ...createAddressDto, clientProfileId: sub },
               })
            case 'ProviderGroup':
               return await this.prismaService.address.create({
                  data: { ...createAddressDto, providerProfileId: sub },
               })
         }
      } catch (error) {
         throw PostgresError(error)
      }
   }

   private async checkOwnership(
      sub: string,
      addressId: string,
   ): Promise<Omit<Address, 'clientProfile' | 'providerProfile'>> {
      if (!sub || !addressId) {
         throw new ForbiddenException('Invalid input parameters')
      }

      const address = await this.prismaService.address.findUnique({
         where: { addressId },
      })

      if (!address) {
         throw new NotFoundException('Address not found')
      }

      const allowedIds = [address.clientProfileId, address.providerProfileId]

      if (!allowedIds.includes(sub)) {
         throw new ForbiddenException(
            'You are not authorized to get or update or delete this address',
         )
      }
      return address
   }

   async findAddress(sub: string, addressId: string) {
      try {
         return await this.checkOwnership(sub, addressId)
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async findManyAddress(sub: string) {
      try {
         return await this.prismaService.address.findMany({
            where: {
               OR: [{ clientProfileId: sub }, { providerProfileId: sub }],
            },
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async updateAdress(
      sub: string,
      addressId: string,
      updateAddressDto: UpdateAddressDto,
   ) {
      try {
         await this.checkOwnership(sub, addressId)

         return await this.prismaService.address.update({
            where: { addressId },
            data: updateAddressDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async deleteAdress(sub: string, addressId: string) {
      try {
         await this.checkOwnership(sub, addressId)

         return await this.prismaService.address.delete({
            where: { addressId },
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
