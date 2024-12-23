import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import {
   Controller,
   Post,
   Body,
   Get,
   Query,
   Patch,
   Delete,
} from '@nestjs/common'
import { VehicleService } from './vehicle.service'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { UpdateVehicleDto } from './dto/update-vehicle.dto'

@Controller('vehicle')
export class VehicleController {
   constructor(private readonly vehicleService: VehicleService) {}

   @Post('create')
   @Authorization({ allowedGroups: ['DriverGroup'] })
   async createVehicle(
      @CognitoUser('sub') driverProfileId: string,
      @Body()
      createVehicleDto: CreateVehicleDto,
   ) {
      return await this.vehicleService.createVehicle(
         driverProfileId,
         createVehicleDto,
      )
   }

   @Get('findVehicle')
   @Authorization({ allowedGroups: ['DriverGroup'] })
   async findVehicle(
      @CognitoUser('sub') driverProfileId: string,
      @Query('vehicleId') vehicleId: string,
   ) {
      return await this.vehicleService.findVehicle(driverProfileId, vehicleId)
   }

   @Get('findMany')
   @Authorization({ allowedGroups: ['DriverGroup'] })
   async findManyVehicle(@CognitoUser('sub') driverProfileId: string) {
      return await this.vehicleService.findManyVehicle(driverProfileId)
   }

   @Patch('update')
   @Authorization({ allowedGroups: ['DriverGroup'] })
   async updateVehicle(
      @CognitoUser('sub') driverProfileId: string,
      @Query('vehicleId') vehicleId: string,
      @Body() updateVehicleDto: UpdateVehicleDto,
   ) {
      return await this.vehicleService.updateVehicle(
         driverProfileId,
         vehicleId,
         updateVehicleDto,
      )
   }

   @Delete('delete')
   @Authorization({ allowedGroups: ['DriverGroup'] })
   async deleteVehicle(
      @CognitoUser('sub') driverProfileId: string,
      @Query('vehicleId') vehicleId: string,
   ) {
      return await this.vehicleService.deleteVehicle(driverProfileId, vehicleId)
   }
}
