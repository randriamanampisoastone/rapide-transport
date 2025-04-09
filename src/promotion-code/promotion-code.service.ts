import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'
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
import { SmsService } from 'src/sms/sms.service'
import { RedisService } from 'src/redis/redis.service'
import { CLIENT_PROMOTION_CODE_PREFIX } from 'constants/redis.constant'

@Injectable()
export class PromotionCodeService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly gateway: Gateway,
      private readonly smsService: SmsService,
      private readonly redisService: RedisService,
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

   async checkPromotionCode(
      phoneNumber: string,
      locale: string,
      promotionCode: string,
   ) {
      try {
         const promotionCodeExist =
            await this.prismaService.promotionCode.findUnique({
               where: {
                  code: promotionCode,
                  isAvailable: true,
                  startAt: { lte: new Date() },
                  expiredAt: { gt: new Date() },
               },
               include: { promotionServices: true },
            })

         if (!promotionCodeExist) {
            throw new NotFoundException(
               'Promotional code does not exist or not available',
            )
         }
         let promotoinsServices = promotionCodeExist.promotionServices

         for (const promotionService of promotoinsServices) {
            if (promotionService.phoneNumbers.includes(phoneNumber)) {
               promotoinsServices = promotoinsServices.filter(
                  (service) =>
                     service.promotionServiceId !==
                     promotionService.promotionServiceId,
               )
            }
         }

         if (promotionCodeExist.customMessage) {
            await this.smsService.sendSMS(
               [phoneNumber],
               promotionCodeExist.customMessage,
            )
         } else {
            if (promotoinsServices.length) {
               let message = ''

               if (locale === 'fr') {
                  message = `Cher client, votre code promotionnel "${promotionCode}" est valide. Vous avez ${promotoinsServices.length} service(s) de réduction.`
               } else if (locale === 'mg') {
                  message = `Ry mpanjifa hajaina, manan-kery ny kaody fampiroboroboana "${promotionCode}". Manana tolotra fihenam-bidy ${promotoinsServices.length} ianao.`
               } else if (locale === 'en') {
                  message = `Dear customer, your promotional code "${promotionCode}" is valid. You have ${promotoinsServices.length} discount service(s).`
               } else if (locale === 'zh') {
                  message = `尊敬的客户，您的优惠码 "${promotionCode}" 有效。您有 ${promotoinsServices.length} 项优惠服务。`
               }

               await this.smsService.sendSMS([phoneNumber], message)
            } else {
               let message = ''

               if (locale === 'fr') {
                  message = `Vous avez epuiser vos service de reduction sur ce code promotionel`
               } else if (locale === 'mg') {
                  message = ``
               } else if (locale === 'en') {
                  message = ``
               } else if (locale === 'zh') {
                  message = ``
               }

               await this.smsService.sendSMS([phoneNumber], message)
            }
         }

         return promotoinsServices
      } catch (error) {
         throw error
      }
   }

   async chousePromotionService(
      clientProfileId: string,
      phoneNumber: string,
      promotionServiceId: string,
   ) {
      try {
         const promotionService =
            await this.prismaService.promotionService.findUnique({
               where: { promotionServiceId },
            })

         if (promotionService.phoneNumbers.includes(phoneNumber)) {
            throw new BadRequestException(
               'You already used this discount service',
            )
         }

         if (!promotionService) {
            throw new NotFoundException('Promotion service not found')
         }

         await this.redisService.set(
            `${CLIENT_PROMOTION_CODE_PREFIX}-${clientProfileId}`,
            JSON.stringify({
               promotionServiceId: promotionService.promotionServiceId,
               phoneNumber,
            }),
            24 * 3600,
         )
      } catch (error) {
         throw error
      }
   }

   async getUsedClientPromotionServiceInRedis(clientProfileId: string) {
      try {
         const rideData: { promotionServiceId: string; phoneNumber: string } =
            JSON.parse(
               await this.redisService.get(
                  `${CLIENT_PROMOTION_CODE_PREFIX}-${clientProfileId}`,
               ),
            )
         if (!rideData) {
            return null
         }
         const promotionService =
            await this.prismaService.promotionService.findUnique({
               where: { promotionServiceId: rideData.promotionServiceId },
            })
         return {
            promotionService,
            phoneNumber: rideData.phoneNumber,
         }
      } catch (error) {
         throw error
      }
   }

   async addClientPhoneNumberOnPromotionService(
      phoneNumber: string,
      promotionServiceId: string,
   ) {
      try {
         await this.prismaService.promotionService.update({
            where: { promotionServiceId },
            data: {
               phoneNumbers: { push: phoneNumber },
               promotionCode: {
                  update: {
                     usedCount: {
                        increment: 1,
                     },
                  },
               },
            },
         })
      } catch (error) {
         throw error
      }
   }
}
