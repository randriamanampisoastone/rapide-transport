import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common'
import { GetRideInvoiceService } from './get-ride-invoice.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'

@Controller('ride-invoice')
export class RideInvoiceController {
   constructor(private readonly getRideInvoiceService: GetRideInvoiceService) {}

   @Get()
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getInvoices(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getRideInvoiceService.getInvoices(
         page || 1,
         pageSize || 10,
      )
   }

   @Get('get-client-invoice')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async getClientInvoices(
      @GetUser('sub') clientProfileId: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getRideInvoiceService.getClientInvoices(
         clientProfileId,
         page || 1,
         pageSize || 10,
      )
   }
}
