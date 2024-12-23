import {
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PostgresError } from 'errors/postgres.error'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { Vehicle } from '@prisma/client'
import { UpdateVehicleDto } from './dto/update-vehicle.dto'

@Injectable()
export class VehicleService {
   constructor(private readonly prismaService: PrismaService) {}

   async createVehicle(
      driverProfileId: string,
      createVehicleDto: CreateVehicleDto,
   ) {
      try {
         return await this.prismaService.vehicle.create({
            data: { ...createVehicleDto, driverProfileId },
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   private async checkOwnership(
      driverProfileId: string,
      vehicleId: string,
   ): Promise<Omit<Vehicle, 'providerProfile'>> {
      if (!vehicleId) {
         throw new ForbiddenException('Invalid input parameters')
      }

      const vehicle = await this.prismaService.vehicle.findUnique({
         where: { vehicleId },
      })

      if (!vehicle) {
         throw new NotFoundException('vehicle not found')
      }

      if (vehicle.driverProfileId !== driverProfileId) {
         throw new ForbiddenException(
            'You are not authorized to get or update or delete this vehicle',
         )
      }
      return vehicle
   }

   async findVehicle(driverProfileId: string, vehicleId: string) {
      try {
         return await this.checkOwnership(driverProfileId, vehicleId)
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async findManyVehicle(driverProfileId: string) {
      try {
         return await this.prismaService.vehicle.findMany({
            where: { driverProfileId },
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async updateVehicle(
      driverProfileId: string,
      vehicleId: string,
      updateVehicleDto: UpdateVehicleDto,
   ) {
      try {
         await this.checkOwnership(driverProfileId, vehicleId)

         return await this.prismaService.vehicle.update({
            where: { vehicleId },
            data: updateVehicleDto,
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }

   async deleteVehicle(driverProfileId: string, vehicleId: string) {
      try {
         await this.checkOwnership(driverProfileId, vehicleId)

         return await this.prismaService.vehicle.delete({
            where: { vehicleId },
         })
      } catch (error) {
         throw PostgresError(error)
      }
   }
}
