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

@Controller('delete-profile')
export class DeleteProfileController {
   constructor(private readonly deleteProfileService: DeleteProfileService) {}

   @Delete('by-admin')
   @SetMetadata('allowedRole', ['ADMIN', 'SUPER_ADMIN'])
   @UseGuards(RolesGuard)
   async deleteProfileByAdmin(@Body('profileId') sub: string) {
      return await this.deleteProfileService.deleteProfileByAdmin(sub)
   }

   @Post('by-customer')
   async deleteProfile(@Body('phoneNumber') phoneNumber: string) {
      return await this.deleteProfileService.deleteProfile(phoneNumber)
   }

   @Post('confirm-delete-infornation')
   async confirmDeleteInformation(
      @Body() confirmDeleteProfileDto: ConfirmDeleteProfileDto,
   ) {
      return await this.deleteProfileService.confirmDeleteInformation(
         confirmDeleteProfileDto,
      )
   }

   @Post('send-delete-code-confirnation')
   async sendConfirmationCodeForDelete(@Body('profileId') profileId: string) {
      return await this.deleteProfileService.sendConfirmationCodeForDelete(
         profileId,
      )
   }

   @Delete('confirm-delete-profile')
   async connfirmDeleteProfile(
      @Body() confirmDeleteDto: ConfirmDeleteProfileDto,
   ) {
      return await this.deleteProfileService.confirmDeleteProfile(
         confirmDeleteDto,
      )
   }

   @Post('resend-code')
   async resendCode(@Body('profileId') profileId: string) {
      return await this.deleteProfileService.resendCode(profileId)
   }
}