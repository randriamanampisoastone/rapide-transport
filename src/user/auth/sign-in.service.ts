import { Injectable, OnModuleInit } from '@nestjs/common'
import {
   AuthFlowType,
   CognitoIdentityProviderClient,
   InitiateAuthCommand,
   InitiateAuthCommandInput,
   InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider'
import { InjectCognitoIdentityProvider } from '@nestjs-cognito/core'
import { ConfigService } from '@nestjs/config'
import {
   RefreshTokenDto,
   RefreshTokenResponse,
   SignInDto,
   SignInResponse,
} from './dto/sign-in.dto'
import { CognitoError } from 'errors/cognito.error'

@Injectable()
export class SignInService implements OnModuleInit {
   private clientProfileId: string = ''

   constructor(
      @InjectCognitoIdentityProvider()
      private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient,
      private configService: ConfigService,
   ) {}

   onModuleInit() {
      this.clientProfileId = this.configService.get<string>('COGNITO_CLIENT_ID')
   }

   async signIn(signInDto: SignInDto): Promise<SignInResponse> {
      const params: InitiateAuthCommandInput = {
         AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
         ClientId: this.clientProfileId,
         AuthParameters: {
            USERNAME: signInDto.email,
            PASSWORD: signInDto.password,
         },
      }
      try {
         const command: InitiateAuthCommand = new InitiateAuthCommand(params)
         const result: InitiateAuthCommandOutput =
            await this.cognitoIdentityProviderClient.send(command)
         return {
            accessToken: result.AuthenticationResult.AccessToken,
            idToken: result.AuthenticationResult.IdToken,
            refreshToken: result.AuthenticationResult.RefreshToken,
         }
      } catch (error) {
         CognitoError(error)
      }
   }

   async refreshToken(
      refreshTokenDto: RefreshTokenDto,
   ): Promise<RefreshTokenResponse> {
      const params: InitiateAuthCommandInput = {
         AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
         ClientId: this.clientProfileId,
         AuthParameters: {
            REFRESH_TOKEN: refreshTokenDto.refreshToken,
         },
      }
      try {
         const command: InitiateAuthCommand = new InitiateAuthCommand(params)
         const result: InitiateAuthCommandOutput =
            await this.cognitoIdentityProviderClient.send(command)
         return {
            accessToken: result.AuthenticationResult.AccessToken,
            idToken: result.AuthenticationResult.IdToken,
         }
      } catch (error) {
         CognitoError(error)
      }
   }
}
