import { Injectable, OnModuleInit } from '@nestjs/common'
import { SignUpDto, UserRoleEnum } from './dto/sign-up.dto'
import {
   AdminAddUserToGroupCommand,
   AdminAddUserToGroupCommandInput,
   CognitoIdentityProviderClient,
   SignUpCommand,
   SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'
import { InjectCognitoIdentityProvider } from '@nestjs-cognito/core'
import { ConfigService } from '@nestjs/config'
import { CognitoError } from 'errors/cognito.error'

@Injectable()
export class SignUpService implements OnModuleInit {
   private clientProfileId: string = ''
   private userPoolId: string = ''

   constructor(
      @InjectCognitoIdentityProvider()
      private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient,
      private configService: ConfigService,
   ) {}

   onModuleInit() {
      this.clientProfileId = this.configService.get<string>('COGNITO_CLIENT_ID')
      this.userPoolId = this.configService.get<string>('COGNITO_USER_POOL_ID')
   }

   async signUpUser(email: string, password: string): Promise<string> {
      const params: SignUpCommandInput = {
         ClientId: this.clientProfileId,
         Username: email,
         Password: password,
      }

      const signUpCommand = new SignUpCommand(params)
      const result =
         await this.cognitoIdentityProviderClient.send(signUpCommand)
      return result.UserSub
   }

   async addUserToGroup(email: string, role: UserRoleEnum): Promise<void> {
      const params: AdminAddUserToGroupCommandInput = {
         UserPoolId: this.userPoolId,
         Username: email,
         GroupName: role,
      }

      const command = new AdminAddUserToGroupCommand(params)
      await this.cognitoIdentityProviderClient.send(command)
   }

   async signUp(signUpDto: SignUpDto) {
      try {
         const userId = await this.signUpUser(
            signUpDto.email,
            signUpDto.password,
         )
         await this.addUserToGroup(signUpDto.email, signUpDto.role)
         return { userId }
      } catch (error) {
         CognitoError(error)
      }
   }
}
