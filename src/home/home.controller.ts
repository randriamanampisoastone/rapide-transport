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
import { ROUTE_HOME } from 'routes/main-routes'
import { UserRole } from '@prisma/client'

@Controller(ROUTE_HOME)
export class HomeController {
   constructor(private readonly homeService: HomeService) {}

   @Get()
   @SetMetadata('allowedRole', [
      UserRole.CLIENT,
      UserRole.DRIVER,
      UserRole.SUPER_ADMIN,
      UserRole.CALL_CENTER,
      UserRole.MANAGER_HUB,
      UserRole.RIDER,
   ])
   @UseGuards(RolesGuard)
   async getHomes() {
      return await this.homeService.getHomes()
   }

   @Post()
   @SetMetadata('allowedRole', [UserRole.MANAGER_HUB, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async addNewHome(@Body() createHomeDto: CreateHomeDto) {
      return await this.homeService.addNewHome(createHomeDto)
   }

   @Delete()
   @SetMetadata('allowedRole', [UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async removeHome(@Query('homeId') homeId: string) {
      return await this.homeService.removeHome(homeId)
   }

   @Patch()
   @SetMetadata('allowedRole', [UserRole.MANAGER_HUB, UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async updateHome(
      @Query('homeId') homeId: string,
      @Body() updateHomeDto: updateHomeDto,
   ) {
      return await this.homeService.updateHome(homeId, updateHomeDto)
   }
}
