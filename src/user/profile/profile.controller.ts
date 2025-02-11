import {
   Controller,
   Post,
   Body,
   Get,
   Query,
   SetMetadata,
   UseGuards,
   Delete,
   Patch,
} from '@nestjs/common'
import { GetProfileService } from './get.profile.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GoogleAuthService } from '../auth/google.auth.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { UpdateProfileService } from './update.profile.service'
import { DeleteProfileService } from './delete.profile.service'
import { ProfileStatus } from '@prisma/client'
import { UpdateProfileDto } from './dto/update.profile.dto'

@Controller('profile')
export class ProfileController {
   constructor(
      private readonly getProfileService: GetProfileService,
      private readonly googleAuthService: GoogleAuthService,
      private readonly updateProfileService: UpdateProfileService,
      private readonly deleteProfileService: DeleteProfileService,
   ) {}

   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   @Get('getClientProfile')
   async getClientProfile(@GetUser('sub') sub: string) {
      return await this.getProfileService.getClientProfile(sub)
   }

   @SetMetadata('allowedRole', ['DRIVER'])
   @UseGuards(RolesGuard)
   @Get('getDriverProfile')
   async getDriverProfile(@GetUser('sub') sub: string) {
      return await this.getProfileService.getDriverProfile(sub)
   }

   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   @Get('getAdminProfile')
   async getAdminProfile(@GetUser('sub') sub: string) {
      return await this.getProfileService.getAdminProfile(sub)
   }

   @Get('findClientProfile')
   async findClientProfile(
      @Query('sub')
      clientProfileId: string,
   ) {
      return await this.getProfileService.getClientProfile(clientProfileId)
   }

   @Get('getFullClientProfile')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getFullClientProfile(
      @Query('clientProfileId')
      clientProfileId: string,
   ) {
      return await this.getProfileService.getFullClientProfile(clientProfileId)
   }

   @Get('getClients')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getClients(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getClients(page || 1, pageSize || 10)
   }

   @Get('searchClientByTerm')
   @SetMetadata('allowedRole', ['ADMIN'])
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
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getFullDriverProfile(
      @Query('driverProfileId')
      driverProfileId: string,
   ) {
      return await this.getProfileService.getFullDriverProfile(driverProfileId)
   }

   @Get('getDrivers')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getDrivers(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getProfileService.getDrivers(page || 1, pageSize || 10)
   }

   @Get('searchDriverByTerm')
   @SetMetadata('allowedRole', ['ADMIN'])
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

   @Post('googleAuth')
   async googleAuth(
      @Body()
      data: {
         idToken: string
      },
   ) {
      return await this.googleAuthService.googleAuth(data.idToken)
   }

   @Get('getClientByIds')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getClientByIds(@Query('clientProfileIds') clientProfileIds: string[]) {
      return await this.getProfileService.getClientByIds(clientProfileIds)
   }

   @Get('getDriverByIds')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getDriverByIds(@Query('driverProfileIds') driverProfileIds: string[]) {
      return await this.getProfileService.getDriverByIds(driverProfileIds)
   }

   @Delete('deleteProfile')
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async deleteProfile(@Query('sub') sub: string) {
      return await this.deleteProfileService.deleteClientProfile(sub)
   }

   @Patch('updateProfile')
   @SetMetadata('allowedRole', ['CLIENT', 'DRIVER'])
   @UseGuards(RolesGuard)
   async updateProfile(
      @GetUser('sub') sub: string,
      @Body() updateProfileDto: UpdateProfileDto,
   ) {
      return await this.updateProfileService.updateProfile(
         sub,
         updateProfileDto,
      )
   }

   @Patch('updateProfileByAdmin')
   @SetMetadata('allowedRole', ['ADMIN'])
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
   @SetMetadata('allowedRole', ['ADMIN'])
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
   @SetMetadata('allowedRole', ['ADMIN'])
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
}
