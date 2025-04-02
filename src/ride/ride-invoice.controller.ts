import {
   Controller,
   ForbiddenException,
   Get,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { GetRideInvoiceService } from './get-ride-invoice.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { ProfileStatus, UserRole } from '@prisma/client'
import { ROUTE_INVOICE_RIDE } from 'routes/main-routes'
import { ROUTE_GET_CLIENT_INVOICE } from 'routes/secondary-routes'

@Controller(ROUTE_INVOICE_RIDE)
export class RideInvoiceController {
   constructor(private readonly getRideInvoiceService: GetRideInvoiceService) {}

   @Get()
   @SetMetadata('allowedRole', [
      UserRole.SUPER_ADMIN,
      UserRole.DEPOSITOR,
      UserRole.MANAGER_HUB,
   ])
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

   @Get(ROUTE_GET_CLIENT_INVOICE)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async getClientInvoices(
      @GetUser('sub') clientProfileId: string,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getRideInvoiceService.getClientInvoices(
         clientProfileId,
         page || 1,
         pageSize || 10,
      )
   }
}
