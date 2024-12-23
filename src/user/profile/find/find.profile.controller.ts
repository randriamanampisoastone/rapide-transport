import { Controller, Get, Query } from '@nestjs/common'
import { FindClientProfileService } from './find.client.profile..service'
import { Authorization, CognitoUser } from '@nestjs-cognito/auth'
import { FindProviderProfileService } from './find.provider.profile.service'
import { FindDriverProfileService } from './find.driver.profile.service'
import { GenderType, ProfileStatus } from '@prisma/client'

@Controller('find-profile')
export class FindProfileController {
   constructor(
      private readonly findClientProfileService: FindClientProfileService,
      private readonly findProviderProfileService: FindProviderProfileService,
      private readonly findDriverProfileService: FindDriverProfileService,
   ) {}
   @Get()
   @Authorization({
      allowedGroups: ['AdminGroup'],
   })
   async findProfiles(
      @Query('role') role: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      switch (role) {
         case 'ClientGroup':
            return await this.findClientProfileService.findProfiles(
               page || 1,
               pageSize || 10,
            )
         case 'ProviderGroup':
            return await this.findProviderProfileService.findProfiles(
               page || 1,
               pageSize || 10,
            )
         case 'DriverGroup':
            return await this.findDriverProfileService.findProfiles(
               page || 1,
               pageSize || 10,
            )
      }
   }

   @Get('by-id')
   @Authorization({
      allowedGroups: [
         'ClientGroup',
         'ProviderGroup',
         'DriverGroup',
         'AdminGroup',
      ],
   })
   async findProfileById(
      @CognitoUser('groups') groups: string[],
      @CognitoUser('sub') sub: string,
      @Query('id') id: string,
      @Query('role') role: string,
   ) {
      const group = groups[0]

      switch (group) {
         case 'ClientGroup':
            return await this.findClientProfileService.findProfileById(sub)
         case 'ProviderGroup':
            return await this.findProviderProfileService.findProfileById(sub)
         case 'DriverGroup':
            return await this.findDriverProfileService.findProfileById(sub)
         case 'AdminGroup':
            switch (role) {
               case 'ClientGroup':
                  return await this.findClientProfileService.findProfileById(id)
               case 'ProviderGroup':
                  return await this.findProviderProfileService.findProfileById(
                     id,
                  )
               case 'DriverGroup':
                  return await this.findDriverProfileService.findProfileById(id)
            }
      }
   }

   @Get('by-gender')
   @Authorization({
      allowedGroups: ['AdminGroup'],
   })
   async findProfileByGender(
      @Query('gender') gender: GenderType,
      @Query('role') role: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      switch (role) {
         case 'ClientGroup':
            return await this.findClientProfileService.findProfilesByGender(
               gender,
               page || 1,
               pageSize || 10,
            )
         case 'DriverGroup':
            return await this.findDriverProfileService.findProfilesByGender(
               gender,
               page || 1,
               pageSize || 10,
            )
      }
   }

   @Get('by-status')
   @Authorization({
      allowedGroups: ['AdminGroup'],
   })
   async findProfileByStatus(
      @Query('status') status: ProfileStatus,
      @Query('role') role: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      switch (role) {
         case 'ClientGroup':
            return await this.findClientProfileService.findProfilesByStatus(
               status,
               page || 1,
               pageSize || 10,
            )
         case 'ProviderGroup':
            return await this.findProviderProfileService.findProfilesByStatus(
               status,
               page || 1,
               pageSize || 10,
            )
         case 'DriverGroup':
            return await this.findDriverProfileService.findProfilesByStatus(
               status,
               page || 1,
               pageSize || 10,
            )
      }
   }

   @Get('by-searchTerm')
   @Authorization({
      allowedGroups: ['AdminGroup'],
   })
   async findProfileBySearchTerm(
      @Query('searchTerm') searchTerm: string,
      @Query('role') role: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      switch (role) {
         case 'ClientGroup':
            return await this.findClientProfileService.findProfilesBySearchTerm(
               searchTerm,
               page || 1,
               pageSize || 10,
            )
         case 'ProviderGroup':
            return await this.findProviderProfileService.findProfilesBySearchTerm(
               searchTerm,
               page || 1,
               pageSize || 10,
            )
         case 'DriverGroup':
            return await this.findDriverProfileService.findProfilesBySearchTerm(
               searchTerm,
               page || 1,
               pageSize || 10,
            )
      }
   }

   @Get('statistic')
   @Authorization({
      allowedGroups: ['AdminGroup'],
   })
   async getStatistics(@Query('role') role: string) {
      switch (role) {
         case 'ClientGroup':
            return await this.findClientProfileService.getStatistics()
         case 'ProviderGroup':
            return await this.findProviderProfileService.getStatistics()
         case 'DriverGroup':
            return await this.findDriverProfileService.getStatistics()
      }
   }
}
