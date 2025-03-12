import {
   Body,
   Controller,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { DepositeService } from './deposite.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { GetUser } from 'src/jwt/get.user.decorator'
import { DepositeDto } from './dto/deposite.dto'

@Controller('payment')
export class PaymentController {
   constructor(private readonly depositeService: DepositeService) {}

   @Post('deposite')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async deposite(
      @GetUser('sub') adminProfileId: string,
      @Query('clientProfileId') clientProfileId: string,
      @Body() depositeDto: DepositeDto,
   ) {
      return this.depositeService.deposite(
         adminProfileId,
         clientProfileId,
         depositeDto,
      )
   }
}
