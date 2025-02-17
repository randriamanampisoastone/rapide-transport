import { Controller, Get, Query } from '@nestjs/common'
import { GetRideInvoiceService } from './get-ride-invoice.service'

@Controller('ride-invoice')
export class RideInvoiceController {
   constructor(private readonly getRideInvoiceService: GetRideInvoiceService) {}

   @Get()
   async getInvoices(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
   ) {
      return await this.getRideInvoiceService.getInvoices(page || 1, pageSize || 10)
   }
}
