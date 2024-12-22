import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class CognitoService {
  private readonly jwksClient: jwksRsa.JwksClient;

  constructor(private readonly configService: ConfigService) {
    this.jwksClient = jwksRsa({
      jwksUri: configService.get<string>('AWS_COGNITO_JWKS_URI'),
      cache: true,
      rateLimit: true,
    });
  }
  async validateToken(token: string): Promise<any> {
    try {
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken || typeof decodedToken === 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      const kid = decodedToken.header.kid;
      const key = await this.jwksClient.getSigningKey(kid);
      const publicKey = key.getPublicKey();

      // Vérification du token avec la clé publique
      return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: this.configService.get<string>('AWS_COGNITO_ISSUER'),
      });
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
