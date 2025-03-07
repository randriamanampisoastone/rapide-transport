import {
   Body,
   Controller,
   Delete,
   Get,
   Patch,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { HomeService } from './home.service'
import { CreateHomeDto } from './dto/create-home.dto'
import { updateHomeDto } from './dto/update-home.dto'
import { RolesGuard } from 'src/jwt/roles.guard'

@Controller('home')
export class HomeController {
   constructor(private readonly homeService: HomeService) {}

   @Get()
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async getHomes() {
      return await this.homeService.getHomes()
   }

   @Post()
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async addNewHome(@Body() createHomeDto: CreateHomeDto) {
      return await this.homeService.addNewHome(createHomeDto)
   }

   @Delete()
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async removeHome(@Query('homeId') homeId: string) {
      return await this.homeService.removeHome(homeId)
   }

   @Patch()
   @SetMetadata('allowedRole', ['ADMIN'])
   @UseGuards(RolesGuard)
   async updateHome(
      @Query('homeId') homeId: string,
      @Body() updateHomeDto: updateHomeDto,
   ) {
      return await this.homeService.updateHome(homeId, updateHomeDto)
   }
}
