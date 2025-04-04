import { Injectable } from '@nestjs/common'
import { CreatePromotionCodeDto } from './dto/create.promotion.code.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Gateway } from 'src/gateway/gateway'
import { UserRole } from 'enums/profile.enum'
import {
   EVENT_NEW_PROMOTION_CODE_CREATED,
   EVENT_PROMOTION_CODE_UPDATED,
} from 'constants/event.constant'
import { UpdatePromotionCodeDto } from './dto/update.promotion.code.dto'
import { UpdatePromotionServicesDto } from './dto/update.promotion.service.dto'

@Injectable()
export class PromotionCodeService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly gateway: Gateway,
   ) {}

   async createNewPromotionCode(
      createPromotionCodeDto: CreatePromotionCodeDto,
   ) {
      try {
         const { promotionServices, ...promotionCode } = createPromotionCodeDto
         const newPromotionCode = await this.prismaService.promotionCode.create(
            {
               data: {
                  ...promotionCode,
                  promotionServices: {
                     create: promotionServices,
                  },
               },
               include: { promotionServices: true },
            },
         )
         await this.gateway.sendNotificationToAdmin(
            [UserRole.SUPER_ADMIN],
            EVENT_NEW_PROMOTION_CODE_CREATED,
            {
               promotionCodeId: newPromotionCode.promotionCodeId,
               code: promotionCode.code,
               promotionServices: promotionServices,
            },
         )
         return newPromotionCode
      } catch (error) {
         throw error
      }
   }

   async changePromotionCodeAvailability(
      promotionCodeId: string,
      isAvailable: boolean,
   ) {
      try {
         await this.prismaService.promotionCode.update({
            where: { promotionCodeId },
            data: { isAvailable },
         })
      } catch (error) {
         throw error
      }
   }

   async getPromotionCodes(page, pageSize) {
      try {
         const [promotionCodes, totalCount] = await Promise.all([
            await this.prismaService.promotionCode.findMany({
               include: { promotionServices: true },
               orderBy: { createdAt: 'desc' },
               skip: (page - 1) * pageSize,
               take: pageSize,
            }),
            await this.prismaService.promotionCode.count(),
         ])
         return {
            data: promotionCodes,
            hasMore: page * pageSize < totalCount,
            totalCount: totalCount,
         }
      } catch (error) {
         throw error
      }
   }

   async getPromotionCode(promotionCodeId: string) {
      try {
         return await this.prismaService.promotionCode.findUnique({
            where: { promotionCodeId },
            include: { promotionServices: true },
         })
      } catch (error) {
         throw error
      }
   }

   async updatePromotionCode(updatePromotionCodeDto: UpdatePromotionCodeDto) {
      try {
         const { promotionCodeId, ...promotionCode } = updatePromotionCodeDto
         const updatedPromotionCode =
            await this.prismaService.promotionCode.update({
               where: { promotionCodeId },
               data: { ...promotionCode, isAvailable: false },
               include: { promotionServices: true },
            })
         await this.gateway.sendNotificationToAdmin(
            [UserRole.SUPER_ADMIN],
            EVENT_PROMOTION_CODE_UPDATED,
            {
               promotionCodeId: updatedPromotionCode.promotionCodeId,
               code: updatedPromotionCode.code,
            },
         )
         return updatedPromotionCode
      } catch (error) {
         throw error
      }
   }

   async updatePromotionService(
      updatePromotionServicesDto: UpdatePromotionServicesDto,
   ) {
      try {
         const { promotionServiceId, ...promotionService } =
            updatePromotionServicesDto
         const updatedPromotionService =
            await this.prismaService.promotionService.update({
               where: { promotionServiceId },
               data: {
                  ...promotionService,
                  promotionCode: { update: { isAvailable: false } },
               },
               include: { promotionCode: true },
            })
         await this.gateway.sendNotificationToAdmin(
            [UserRole.SUPER_ADMIN],
            EVENT_PROMOTION_CODE_UPDATED,
            {
               promotionCodeId: updatedPromotionService.promotionCodeId,
               code: updatedPromotionService.promotionCode.code,
            },
         )
         return updatePromotionServicesDto
      } catch (error) {
         throw error
      }
   }
}
