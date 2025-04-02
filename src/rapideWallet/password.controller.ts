import {
   Body,
   Controller,
   ForbiddenException,
   Patch,
   Post,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { PasswordService } from './password.service'
import { GetUser } from 'src/jwt/get.user.decorator'
import { RolesGuard } from 'src/jwt/roles.guard'
import { ProfileStatus, UserRole } from '@prisma/client'
import { ChangePasswordDto } from './dto/changePassword.dto'
import { ResetClientPasswordDto } from './dto/reset-client-password.dto'
import { ROUTE_PASSWORD } from 'routes/main-routes'
import { ROUTE_CLIENT_CHANGE_PASSWORD, ROUTE_RESET_CLIENT_PASSWORD, ROUTE_SET_ADMIN_PASSWORD } from 'routes/secondary-routes'

@Controller(ROUTE_PASSWORD)
export class PasswordController {
   constructor(private readonly passwordService: PasswordService) {}

   @Post(ROUTE_SET_ADMIN_PASSWORD)
   @SetMetadata('allowedRole', [
      UserRole.DEPOSITOR,
      UserRole.TREASURER,
      UserRole.SUPER_ADMIN,
   ])
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

   @Patch(ROUTE_CLIENT_CHANGE_PASSWORD)
   @SetMetadata('allowedRole', [UserRole.CLIENT])
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

   @Patch(ROUTE_RESET_CLIENT_PASSWORD)
   @SetMetadata('allowedRole', [UserRole.DEPOSITOR])
   @UseGuards(RolesGuard)
   async resetClientPassword(
      @Body() resetClientPasswordDto: ResetClientPasswordDto,
      @GetUser('status') status: ProfileStatus,
   ) {
      if (status !== ProfileStatus.ACTIVE) {
         throw new ForbiddenException('Account is not activate')
      }
      return this.passwordService.resetClientPassword(
         resetClientPasswordDto.clientProfileId,
         resetClientPasswordDto.newPassword,
      )
   }
}
