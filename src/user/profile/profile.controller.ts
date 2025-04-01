import {
   Controller,
   Body,
   Get,
   Query,
   SetMetadata,
   UseGuards,
   Patch,
   ForbiddenException,
} from '@nestjs/common'
import { GetProfileService } from './get.profile.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { UpdateProfileService } from './update.profile.service'
import { ProfileStatus, UserRole } from '@prisma/client'
import { UpdateProfileDto } from './dto/update.profile.dto'
import { UpdateAdminStatusDto } from './dto/update.admin.status.dto'
import { UpdateAdminRoleDto } from './dto/update.admin.role.dto'
import { ROUTE_PROFILE } from 'routes/main-routes'
import {
   ROUTE_FIND_CLIENT_PROFILE,
   ROUTE_GET_ADMIN_PROFILE,
   ROUTE_GET_CLIENT_PROFILE,
   ROUTE_GET_DRIVER_PROFILE,
} from 'routes/secondary-routes'

@Controller(ROUTE_PROFILE)
export class ProfileController {
   constructor(
      private readonly getProfileService: GetProfileService,
      private readonly updateProfileService: UpdateProfileService,
   ) {}

   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   @Get(ROUTE_GET_CLIENT_PROFILE)
   async getClientProfile(
      @GetUser('sub') sub: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getProfileService.getClientProfile(sub)
   }

   @SetMetadata('allowedRole', [UserRole.DRIVER])
   @UseGuards(RolesGuard)
   @Get(ROUTE_GET_DRIVER_PROFILE)
   async getDriverProfile(@GetUser('sub') sub: string) {
      return await this.getProfileService.getDriverProfile(sub)
   }

   @SetMetadata('allowedRole', [
      UserRole.SUPER_ADMIN,
      UserRole.TREASURER,
      UserRole.DEPOSITOR,
      UserRole.CALL_CENTER,
      UserRole.MANAGER_HUB,
      UserRole.RIDER,
   ])
   @UseGuards(RolesGuard)
   @Get(ROUTE_GET_ADMIN_PROFILE)
   async getAdminProfile(
      @GetUser('sub') sub: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getProfileService.getAdminProfile(sub)
   }

   @SetMetadata('allowedRole', ['DRIVER', 'ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   @Get(ROUTE_FIND_CLIENT_PROFILE)
   async findClientProfile(
      @Query('clientProfileId')
      clientProfileId: string,
   ) {
      return await this.getProfileService.getClientProfile(clientProfileId)
   }

   @SetMetadata('allowedRole', [
      'CLIENT',
      'ADMIN',
      'SUPER_ADMIN',
      'FLEET_MANAGER',
   ])
   @UseGuards(RolesGuard)
   @Get('findDriverProfile')
   async findDriverProfile(
      @Query('driverProfileId')
      driverProfileId: string,
   ) {
      return await this.getProfileService.getDriverProfile(driverProfileId)
   }

   @Get('getFullClientProfile')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'HUMAN_RESOURCES'])
   @UseGuards(RolesGuard)
   async getFullClientProfile(
      @Query('clientProfileId')
      clientProfileId: string,
   ) {
      return await this.getProfileService.getFullClientProfile(clientProfileId)
   }

   @Get('getClients')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'HUMAN_RESOURCES'])
   @UseGuards(RolesGuard)
   async getClients(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getClients(page || 1, pageSize || 10)
   }

   @Get('searchClientByTerm')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'HUMAN_RESOURCES'])
   @UseGuards(RolesGuard)
   async searchClientByTerm(
      @Query('term') term: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.searchClientByTerm(
         term,
         page || 1,
         pageSize || 10,
      )
   }

   @Get('getFullDriverProfile')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'])
   @UseGuards(RolesGuard)
   async getFullDriverProfile(
      @Query('driverProfileId')
      driverProfileId: string,
   ) {
      return await this.getProfileService.getFullDriverProfile(driverProfileId)
   }

   @Get('getDrivers')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'])
   @UseGuards(RolesGuard)
   async getDrivers(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getDrivers(page || 1, pageSize || 10)
   }

   @Get('searchDriverByTerm')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'])
   @UseGuards(RolesGuard)
   async searchDriverByTerm(
      @Query('term') term: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.searchDriverByTerm(
         term,
         page || 1,
         pageSize || 10,
      )
   }

   @Get('getClientByIds')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'HUMAN_RESOURCES'])
   @UseGuards(RolesGuard)
   async getClientByIds(@Query('clientProfileIds') clientProfileIds: string[]) {
      return await this.getProfileService.getClientByIds(clientProfileIds)
   }

   @Get('getDriverByIds')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'])
   @UseGuards(RolesGuard)
   async getDriverByIds(@Query('driverProfileIds') driverProfileIds: string[]) {
      return await this.getProfileService.getDriverByIds(driverProfileIds)
   }

   @Patch('updateProfile')
   @SetMetadata('allowedRole', ['CLIENT', 'DRIVER'])
   @UseGuards(RolesGuard)
   async updateProfile(
      @GetUser('sub') sub: string,
      @Body() updateProfileDto: UpdateProfileDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.updateProfileService.updateProfile(
         sub,
         updateProfileDto,
      )
   }

   @Patch('updateProfileByAdmin')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async updateProfileByAdmin(
      @Query('sub') sub: string,
      @Body() updateProfileDto: UpdateProfileDto,
   ) {
      return await this.updateProfileService.updateProfile(
         sub,
         updateProfileDto,
      )
   }

   @Patch('udpateClientStatus')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async updateClientProfile(
      @Query('clientProfileId') clientProfileId: string,
      @Query('status') status: ProfileStatus,
   ) {
      return await this.updateProfileService.updateClientStatus(
         clientProfileId,
         status,
      )
   }

   @Patch('udpateDriverStatus')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'])
   @UseGuards(RolesGuard)
   async updateDriverProfile(
      @Query('driverProfileId') driverProfileId: string,
      @Query('status') status: ProfileStatus,
   ) {
      return await this.updateProfileService.updateDriverStatus(
         driverProfileId,
         status,
      )
   }

   @Get('getAdmins')
   @SetMetadata('allowedRole', ['SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async getAdmins(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getAdmins(page || 1, pageSize || 10)
   }

   @Patch('updateAdminStatus')
   @SetMetadata('allowedRole', ['SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async updateAdminStatus(@Body() data: UpdateAdminStatusDto) {
      return await this.updateProfileService.updateAdminStatus(
         data.adminProfileId,
         data.status,
      )
   }

   @Patch('updateAdminRole')
   @SetMetadata('allowedRole', ['SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async updateAdminRole(@Body() data: UpdateAdminRoleDto) {
      return await this.updateProfileService.updateAdminRole(
         data.adminProfileId,
         data.role,
      )
   }
}
