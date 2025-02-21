import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common'
import { HomeService } from './home.service'
import { CreateHomeDto } from './dto/create-home.dto'
import { updateHomeDto } from './dto/update-home.dto'

@Controller('home')
export class HomeController {
   constructor(private readonly homeService: HomeService) {}

   @Get()
   async getHomes() {
      return await this.homeService.getHomes()
   }

   @Post()
   async addNewHome(@Body() createHomeDto: CreateHomeDto) {
      return await this.homeService.addNewHome(createHomeDto)
   }

   @Delete()
   async removeHome(@Query('homeId') homeId: string) {
      return await this.homeService.removeHome(homeId)
   }

   @Patch()
   async updateHome(
      @Query('homeId') homeId: string,
      @Body() updateHomeDto: updateHomeDto,
   ) {
      return await this.homeService.updateHome(homeId, updateHomeDto)
   }
}
