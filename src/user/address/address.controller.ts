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
import { AddressService } from './address.service'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/update-address.dto'

@Controller('address')
export class AddressController {
   constructor(private readonly addressService: AddressService) {}

   @Post('create')
   @Authorization({ allowedGroups: ['ClientGroup', 'ProviderGroup'] })
   async createAddress(
      @CognitoUser('sub') sub: string,
      @CognitoUser('groups') groups: string[],
      @Body()
      createAddressDto: CreateAddressDto,
   ) {
      return await this.addressService.createAddress(
         sub,
         groups[0],
         createAddressDto,
      )
   }

   @Get('findAddress')
   @Authorization({ allowedGroups: ['ClientGroup', 'ProviderGroup'] })
   async findAddress(
      @CognitoUser('sub') sub: string,
      @Query('addressId') addressId: string,
   ) {
      return await this.addressService.findAddress(sub, addressId)
   }

   @Get('findMany')
   @Authorization({ allowedGroups: ['ClientGroup', 'ProviderGroup'] })
   async findManyAddress(@CognitoUser('sub') sub: string) {
      return await this.addressService.findManyAddress(sub)
   }

   @Patch('update')
   @Authorization({ allowedGroups: ['ClientGroup', 'ProviderGroup'] })
   async updateAddress(
      @CognitoUser('sub') sub: string,
      @Query('addressId') addressId: string,
      @Body() updateAddressDto: UpdateAddressDto,
   ) {
      return await this.addressService.updateAdress(
         sub,
         addressId,
         updateAddressDto,
      )
   }

   @Delete('delete')
   @Authorization({ allowedGroups: ['ClientGroup', 'ProviderGroup'] })
   async deleteAddress(
      @CognitoUser('sub') sub: string,
      @Query('addressId') addressId: string,
   ) {
      return await this.addressService.deleteAdress(sub, addressId)
   }
}
