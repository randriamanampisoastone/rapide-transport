import { Module } from '@nestjs/common'
import { HistoricalService } from './historical.service'
import { HistoricalController } from './historical.controller'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
   imports: [],
   controllers: [HistoricalController],
   providers: [HistoricalService, PrismaService],
})
export class HistoricalModule {}
