import { Controller, Body, Patch } from '@nestjs/common'
import { UpdateProfileService } from './update.profile.service'
import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import { UpdateClientProfileDto } from './dto/update-client-profile.dto'
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto'
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto'
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto'

@Controller('update-profile')
export class UpdateProfileController {
   constructor(private readonly updateProfileService: UpdateProfileService) {}

   @Patch('client')
   @Authorization({ allowedGroups: ['ClientGroup'] })
   async updateClientProfile(
      @CognitoUser('sub') clientProfileId: string,
      @Body()
      updateClientProfileDto: UpdateClientProfileDto,
   ) {
      const { birthday, ...restUpdateClientProfileDto } = updateClientProfileDto

      const updatePayload = {
         ...restUpdateClientProfileDto,
         ...(birthday && { birthday: new Date(birthday) }),
      }
      return await this.updateProfileService.updateClientProfile(
         clientProfileId,
         updatePayload,
      )
   }

   @Patch('provider')
   @Authorization({ allowedGroups: ['ProviderGroup'] })
   async updateProviderProfile(
      @CognitoUser('sub') providerProfileId: string,
      @Body()
      updateProviderProfileDto: UpdateProviderProfileDto,
   ) {
      return await this.updateProfileService.updateProviderProfile(
         providerProfileId,
         updateProviderProfileDto,
      )
   }

   @Patch('driver')
   @Authorization({ allowedGroups: ['DriverGroup'] })
   async updateDriverProfile(
      @CognitoUser('sub') driverProfileId: string,
      @Body()
      updateDriverProfileDto: UpdateDriverProfileDto,
   ) {
      const { birthday, ...restUpdateDriverProfileDto } = updateDriverProfileDto
      const updatePayload = {
         ...restUpdateDriverProfileDto,
         ...(birthday && { birthday: new Date(birthday) }),
      }
      return await this.updateProfileService.updateDriverProfile(
         driverProfileId,
         updatePayload,
      )
   }

   @Patch('admin')
   @Authorization({ allowedGroups: ['AdminGroup'] })
   async updateAdminProfile(
      @CognitoUser('sub') adminProfileId: string,
      @Body()
      updateAdminProfileDto: UpdateAdminProfileDto,
   ) {
      return await this.updateProfileService.updateAdminProfile(
         adminProfileId,
         updateAdminProfileDto,
      )
   }
}
