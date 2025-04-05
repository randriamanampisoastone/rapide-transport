import {
   Body,
   Controller,
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

@Controller(ROUTE_PROMOTION_CODE)
export class PromotionCodeController {
   constructor(private readonly promotionCodeService: PromotionCodeService) {}

   @Post(ROUTE_CREATE_NEW_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async createNewPromotionCode(@Body() data: CreatePromotionCodeDto) {
      return await this.promotionCodeService.createNewPromotionCode(data)
   }

   @Patch(ROUTE_CHANGE_PROMOTION_CODE_AVAILABILITY)
   @SetMetadata('allowedRole', [UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async changePromotionCodeAvailability(
      @Body() data: { promotionCodeId: string; isAvailable: boolean },
   ) {
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
   ) {
      return await this.promotionCodeService.getPromotionCodes(page, pageSize)
   }

   @Get(ROUTE_GET_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async getPromotionCode(@Body() data: { promotionCodeId: string }) {
      return await this.promotionCodeService.getPromotionCode(
         data.promotionCodeId,
      )
   }

   @Get(ROUTE_UPDATE_PROMOTION_CODE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async updatePromotionCode(
      @Body() updatePromotionCodeDto: UpdatePromotionCodeDto,
   ) {
      return await this.promotionCodeService.updatePromotionCode(
         updatePromotionCodeDto,
      )
   }

   @Get(ROUTE_UPDATE_PROMOTION_SERVICE)
   @SetMetadata('allowedRole', [UserRole.TREASURER, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async updatePromotionService(
      @Body() updatePromotionServicesDto: UpdatePromotionServicesDto,
   ) {
      return await this.promotionCodeService.updatePromotionService(
         updatePromotionServicesDto,
      )
   }
}
