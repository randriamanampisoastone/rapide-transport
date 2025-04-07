import {
   Body,
   Controller,
   ForbiddenException,
   Get,
   Patch,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { PromotionCodeService } from './promotion-code.service'
import { CreatePromotionCodeDto } from './dto/create.promotion.code.dto'
import { ROUTE_PROMOTION_CODE } from 'routes/main-routes'
import {
   ROUTE_CHANGE_PROMOTION_CODE_AVAILABILITY,
   ROUTE_CHECK_PROMOTION_CODE,
   ROUTE_CHOUSE_PROMOTION_SERVICE,
   ROUTE_CREATE_NEW_PROMOTION_CODE,
   ROUTE_GET_PROMOTION_CODE,
   ROUTE_GET_PROMOTION_CODES,
   ROUTE_UPDATE_PROMOTION_CODE,
   ROUTE_UPDATE_PROMOTION_SERVICE,
} from 'routes/secondary-routes'
import { RolesGuard } from 'src/jwt/roles.guard'
import { UserRole } from 'enums/profile.enum'
import { UpdatePromotionCodeDto } from './dto/update.promotion.code.dto'
import { UpdatePromotionServicesDto } from './dto/update.promotion.service.dto'
import { CheckPromotionCodeDto } from './dto/check.promotion.code.dto'
import { GetUser } from 'src/jwt/get.user.decorator'
import { ProfileStatus } from '@prisma/client'
import { ChousePromotionCodeDto } from './dto/chouse.promotion.code.dto'

@Controller(ROUTE_PROMOTION_CODE)
export class PromotionCodeController {
   constructor(private readonly promotionCodeService: PromotionCodeService) {}

   @Post(ROUTE_CREATE_NEW_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async createNewPromotionCode(
      @Body() data: CreatePromotionCodeDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.createNewPromotionCode(data)
   }

   @Patch(ROUTE_CHANGE_PROMOTION_CODE_AVAILABILITY)
   @SetMetadata('allowedRole', [UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async changePromotionCodeAvailability(
      @Body() data: { promotionCodeId: string; isAvailable: boolean },
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.changePromotionCodeAvailability(
         data.promotionCodeId,
         data.isAvailable,
      )
   }

   @Get(ROUTE_GET_PROMOTION_CODES)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async getPromotionCodes(
      @Query('page') page: number,
      @Query('pageSize') pageSize: number,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.getPromotionCodes(page, pageSize)
   }

   @Get(ROUTE_GET_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async getPromotionCode(
      @Body() data: { promotionCodeId: string },
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.getPromotionCode(
         data.promotionCodeId,
      )
   }

   @Get(ROUTE_UPDATE_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async updatePromotionCode(
      @Body() updatePromotionCodeDto: UpdatePromotionCodeDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.updatePromotionCode(
         updatePromotionCodeDto,
      )
   }

   @Get(ROUTE_UPDATE_PROMOTION_SERVICE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async updatePromotionService(
      @Body() updatePromotionServicesDto: UpdatePromotionServicesDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.updatePromotionService(
         updatePromotionServicesDto,
      )
   }

   @Post(ROUTE_CHECK_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async checkPromotionCode(
      @Body() data: CheckPromotionCodeDto,
      @GetUser('locale') locale: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.checkPromotionCode(
         data.phoneNumber,
         locale,
         data.promotionCode,
      )
   }

   @Post(ROUTE_CHOUSE_PROMOTION_SERVICE)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
   @UseGuards(RolesGuard)
   async chousePromotionService(
      @Body() data: ChousePromotionCodeDto,
      @GetUser('sub') clientProfileId: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('UserNotActive')
      }
      return await this.promotionCodeService.chousePromotionService(
         clientProfileId,
         data.phoneNumber,
         data.promotionServiceId,
      )
   }
}
