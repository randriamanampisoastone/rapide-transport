import { Injectable, OnModuleInit } from '@nestjs/common'
import {
   CognitoIdentityProviderClient,
   ConfirmSignUpCommand,
   ConfirmSignUpCommandInput,
   ResendConfirmationCodeCommand,
   ResendConfirmationCodeCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'
import { InjectCognitoIdentityProvider } from '@nestjs-cognito/core'
import { ConfigService } from '@nestjs/config'
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto'
import { ResendEmailConfirmationCodeDto } from './dto/resend-confirmation-code.dto'
import { CognitoError } from 'errors/cognito.error'

@Injectable()
export class ConfirmSignUpService implements OnModuleInit {
   private clientProfileId: string = ''

   constructor(
      @InjectCognitoIdentityProvider()
      private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient,
      private configService: ConfigService,
   ) {}

   onModuleInit() {
      this.clientProfileId = this.configService.get<string>('COGNITO_CLIENT_ID')
   }

   async confirmSignUp(confirmSignUpDto: ConfirmSignUpDto): Promise<void> {
      const params: ConfirmSignUpCommandInput = {
         ClientId: this.clientProfileId,
         Username: confirmSignUpDto.email,
         ConfirmationCode: confirmSignUpDto.confirmationCode,
      }
      try {
         const command: ConfirmSignUpCommand = new ConfirmSignUpCommand(params)
         await this.cognitoIdentityProviderClient.send(command)
      } catch (error) {
         CognitoError(error)
      }
   }
   async resendEmailConfirmationCode(
      resendEmailConfirmationCodeDto: ResendEmailConfirmationCodeDto,
   ): Promise<void> {
      const params: ResendConfirmationCodeCommandInput = {
         ClientId: this.clientProfileId,
         Username: resendEmailConfirmationCodeDto.email,
      }

      try {
         const command: ResendConfirmationCodeCommand =
            new ResendConfirmationCodeCommand(params)
         await this.cognitoIdentityProviderClient.send(command)
      } catch (error) {
         CognitoError(error)
      }
   }
}
