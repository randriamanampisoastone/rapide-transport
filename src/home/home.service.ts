import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateHomeDto } from './dto/create-home.dto'
import { updateHomeDto } from './dto/update-home.dto'

@Injectable()
export class HomeService {
   constructor(private readonly prismaService: PrismaService) {}

   async getHomes() {
      try {
         return await this.prismaService.home.findMany()
      } catch (error) {
         throw error
      }
   }

   async addNewHome(createHomeDto: CreateHomeDto) {
      try {
         return await this.prismaService.home.create({
            data: { ...createHomeDto },
         })
      } catch (error) {
         throw error
      }
   }

   async removeHome(homeId: string) {
      try {
         return await this.prismaService.home.delete({ where: { homeId } })
      } catch (error) {
         throw error
      }
   }

   async updateHome(homeId: string, updateHomeDto: updateHomeDto) {
      try {
         return await this.prismaService.home.update({
            where: { homeId },
            data: { ...updateHomeDto },
         })
      } catch (error) {
         throw error
      }
   }
}
