import {
   Body,
   Controller,
   ForbiddenException,
   Patch,
   Post,
   Query,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { PasswordService } from './password.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { RolesGuard } from 'src/jwt/roles.guard'
import { ProfileStatus } from '@prisma/client'
import { ChangePasswordDto } from './dto/changePassword.dto'

@Controller('password')
export class PasswordController {
   constructor(private readonly passwordService: PasswordService) {}

   @Post('set-client')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async setClientPassword(
      @GetUser('sub') clientProfileId: string,
      @Body('password') password: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return this.passwordService.setClientPassword(clientProfileId, password)
   }

   @Post('set-admin')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async setAdminPassword(
      @GetUser('sub') adminProfileId: string,
      @Body('password') password: string,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return this.passwordService.setAdminPassword(adminProfileId, password)
   }

   @Patch('change-client-password')
   @SetMetadata('allowedRole', ['CLIENT'])
   @UseGuards(RolesGuard)
   async changeClientPassword(
      @GetUser('sub') clientProfileId: string,
      @Body() changePasswordDto: ChangePasswordDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return this.passwordService.changeClientPassword(
         clientProfileId,
         changePasswordDto.oldWalletPassword,
         changePasswordDto.newWalletPassword,
      )
   }
}
