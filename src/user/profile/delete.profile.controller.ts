import {
   Body,
   Controller,
   Delete,
   Post,
   SetMetadata,
   UseGuards,
} from '@nestjs/common'
import { DeleteProfileService } from './delete.profile.service'
import { RolesGuard } from 'src/jwt/roles.guard'
import { ConfirmDeleteProfileDto } from './dto/confirm.delete.profile.dto'
import { ROUTE_DELETE_PROFILE } from 'routes/main-routes'
import { ROUTE_BY_ADMIN, ROUTE_BY_CUSTOMER, ROUTE_CONFIRM_DELETE_INFORNATION, ROUTE_CONFIRM_DELETE_PROFILE, ROUTE_RESEND_CODE, ROUTE_SEND_DELETE_CODE_CONFIRNATION } from 'routes/secondary-routes'
import { UserRole } from '@prisma/client'

@Controller(ROUTE_DELETE_PROFILE)
export class DeleteProfileController {
   constructor(private readonly deleteProfileService: DeleteProfileService) {}

   @Delete(ROUTE_BY_ADMIN)
   @SetMetadata('allowedRole', [UserRole.SUPER_ADMIN])
   @UseGuards(RolesGuard)
   async deleteProfileByAdmin(@Body('profileId') sub: string) {
      return await this.deleteProfileService.deleteProfileByAdmin(sub)
   }

   @Post(ROUTE_BY_CUSTOMER)
   async deleteProfile(@Body('phoneNumber') phoneNumber: string) {
      return await this.deleteProfileService.deleteProfile(phoneNumber)
   }

   @Post(ROUTE_CONFIRM_DELETE_INFORNATION)
   async confirmDeleteInformation(
      @Body() confirmDeleteProfileDto: ConfirmDeleteProfileDto,
   ) {
      return await this.deleteProfileService.confirmDeleteInformation(
         confirmDeleteProfileDto,
      )
   }

   @Post(ROUTE_SEND_DELETE_CODE_CONFIRNATION)
   async sendConfirmationCodeForDelete(
      @Body('clientProfileId') clientProfileId: string,
   ) {
      return await this.deleteProfileService.sendConfirmationCodeForDelete(
         clientProfileId,
      )
   }

   @Delete(ROUTE_CONFIRM_DELETE_PROFILE)
   async connfirmDeleteProfile(
      @Body() confirmDeleteDto: ConfirmDeleteProfileDto,
   ) {
      return await this.deleteProfileService.confirmDeleteProfile(
         confirmDeleteDto,
      )
   }

   @Post(ROUTE_RESEND_CODE)
   async resendCode(@Body('clientProfileId') clientProfileId: string) {
      return await this.deleteProfileService.resendCode(clientProfileId)
   }
}