import {
   Body,
   Controller,
   ForbiddenException,
   Get,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { DepositeService } from './deposite.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { DepositeDto } from './dto/deposite.dto'
import { GetTransactionService } from './get-transacation.service'
import {
   MethodType,
   ProfileStatus,
   TransactionStatus,
   UserRole,
} from '@prisma/client'
import { ROUTE_TRANSACTION } from 'routes/main-routes'
import {
   ROUTE_ADMIN_SEARCH_TRANSACTIONS_DATA_BY_REFERENCE,
   ROUTE_DEPOSITE,
   ROUTE_GET_TRANSACTIONS,
   ROUTE_GET_USER_TRANSACTIONS,
   ROUTE_GET_USER_TRANSACTIONS_BY_ADMIN,
   ROUTE_USER_SEARCH_TRANSACTIONS_DATA_BY_REFERENCE,
} from 'routes/secondary-routes'

@Controller(ROUTE_TRANSACTION)
export class TransactionController {
   constructor(
      private readonly depositeService: DepositeService,
      private readonly getTransactionService: GetTransactionService,
   ) {}

   @Post(ROUTE_DEPOSITE)
   @SetMetadata('allowedRole', [
      UserRole.DEPOSITOR,
      UserRole.TREASURER,
      UserRole.SUPER_ADMIN,
   ])
   @UseGuards(RolesGuard)
   async deposite(
      @GetUser('sub') adminProfileId: string,
      @Query('clientProfileId') clientProfileId: string,
      @Body() depositeDto: DepositeDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return this.depositeService.deposite(
         adminProfileId,
         clientProfileId,
         depositeDto,
      )
   }

   @Get(ROUTE_GET_TRANSACTIONS)
   @SetMetadata('allowedRole', [
      UserRole.DEPOSITOR,
      UserRole.TREASURER,
      UserRole.SUPER_ADMIN,
   ])
   @UseGuards(RolesGuard)
   async getTransactions(
      @Query('method') method: MethodType,
      @Query('status') status: TransactionStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') profileStatus: ProfileStatus,
   ) {
      if (profileStatus !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getTransactionService.getAllTransactions(
         method,
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_USER_TRANSACTIONS)
   @SetMetadata('allowedRole', [UserRole.CLIENT, UserRole.DRIVER])
   @UseGuards(RolesGuard)
   async getUserTransactions(
      @GetUser('sub') profileId: string,
      @Query('method') method: MethodType,
      @Query('status') status: TransactionStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') profileStatus: ProfileStatus,
   ) {
      if (profileStatus !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getTransactionService.getUserTransactoins(
         profileId,
         method,
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_GET_USER_TRANSACTIONS_BY_ADMIN)
   @SetMetadata('allowedRole', [
      UserRole.DEPOSITOR,
      UserRole.TREASURER,
      UserRole.SUPER_ADMIN,
   ])
   @UseGuards(RolesGuard)
   async getUserTransactionsByAdmin(
      @Query('profileId') profileId: string,
      @Query('method') method: MethodType,
      @Query('status') status: TransactionStatus,
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') profileStatus: ProfileStatus,
   ) {
      if (profileStatus !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getTransactionService.getUserTransactoins(
         profileId,
         method,
         status,
         page || 1,
         pageSize || 10,
      )
   }

   @Get(ROUTE_USER_SEARCH_TRANSACTIONS_DATA_BY_REFERENCE)
   @SetMetadata('allowedRole', [UserRole.CLIENT, UserRole.DRIVER])
   @UseGuards(RolesGuard)
   async getTransactionByReferance(
      @GetUser('sub') profileId: string,
      @Query('reference') reference: number,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getTransactionService.getTransactionByReferance(
         profileId,
         reference,
      )
   }

   @Get(ROUTE_ADMIN_SEARCH_TRANSACTIONS_DATA_BY_REFERENCE)
   @SetMetadata('allowedRole', [
      UserRole.DEPOSITOR,
      UserRole.TREASURER,
      UserRole.SUPER_ADMIN,
   ])
   @UseGuards(RolesGuard)
   async searchTransactionByReference(
      @Query('reference') reference: number,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.getTransactionService.searchTransactionByReference(
         reference,
      )
   }
}
