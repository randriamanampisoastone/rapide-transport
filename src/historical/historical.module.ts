import { Module } from '@nestjs/common'
import { DynamooseModule } from 'nestjs-dynamoose'
import { RideModel } from 'src/ride/Model/ride.model'
import { HistoricalService } from './historical.service'
import { HistoricalController } from './historical.controller'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
   imports: [DynamooseModule.forFeature([RideModel])],
   controllers: [HistoricalController],
   providers: [HistoricalService, PrismaService],
})
export class HistoricalModule {}
