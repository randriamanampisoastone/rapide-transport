import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GetRapideBalanceService {
   constructor(private readonly prismaService: PrismaService) {}

   async getRapidebalance() {
      try {
         const rapideBalance = await this.prismaService.rapideBalance.findMany()
         return rapideBalance[0]
      } catch (error) {
         throw error
      }
   }
}
