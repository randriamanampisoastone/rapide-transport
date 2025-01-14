import { Controller, Post, Body } from '@nestjs/common'

import { CreateClientProfileDto } from './dto/create-client-profile.dto'
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto'
import { CreateAdminProfileDto } from './dto/create-admin-profile.dto'
import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import { CreateClientProfileService } from './create.client.profile.service'
import { CreateProviderProfileService } from './create.provider.profile.service'
import { CreateDriverProfileService } from './create.driver.profile.service'
import { CreateAdminProfileService } from './create.admin.profile.service'

@Controller('create-profile')
export class CreateProfileController {
   constructor(
      private readonly createClientProfileService: CreateClientProfileService,
      private readonly createProviderProfileService: CreateProviderProfileService,
      private readonly createDriverProfileService: CreateDriverProfileService,
      private readonly createAdminProfileService: CreateAdminProfileService,
   ) {}

   @Authorization({ allowedGroups: ['ClientGroup'] })
   @Post('client')
   async createClientProfile(
      @CognitoUser('sub') clientProfileId,
      @CognitoUser('email') email,
      @Body()
      clientProfileDto: CreateClientProfileDto,
   ) {
      return await this.createClientProfileService.createClientProfile(
         clientProfileId,
         email,
         clientProfileDto,
      )
   }
   @Authorization({ allowedGroups: ['ProviderGroup'] })
   @Post('provider')
   async createProviderProfile(
      @CognitoUser('sub') providerProfileId,
      @CognitoUser('email') email,
      @Body()
      providerProfileDto: CreateProviderProfileDto,
   ) {
      return await this.createProviderProfileService.createProviderProfile(
         providerProfileId,
         email,
         providerProfileDto,
      )
   }

   @Authorization({ allowedGroups: ['DriverGroup'] })
   @Post('driver')
   async createDriverProfile(
      @CognitoUser('sub') driverProfileId,
      @CognitoUser('email') email,
      @Body()
      createClientProfileDto: CreateClientProfileDto,
   ) {
      console.log('okok')

      return await this.createDriverProfileService.createDriverProfile(
         driverProfileId,
         email,
         createClientProfileDto,
      )
   }
   @Authorization({ allowedGroups: ['AdminGroup'] })
   @Post('admin')
   async createAdminProfile(
      @CognitoUser('sub') adminProfileId,
      @CognitoUser('email') email,
      @Body()
      createAdminProfileDto: CreateAdminProfileDto,
   ) {
      return await this.createAdminProfileService.createAdminProfile(
         adminProfileId,
         email,
         createAdminProfileDto,
      )
   }
}
