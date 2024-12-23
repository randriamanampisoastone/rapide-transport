import { Module } from '@nestjs/common'
import { CognitoWebSocketService } from './cognito.websocket.service'

@Module({
   providers: [CognitoWebSocketService],
   exports: [CognitoWebSocketService],
})
export class CognitoWebSocketModule {}
