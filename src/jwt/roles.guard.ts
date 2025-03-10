import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
   ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { UserRole } from 'enums/profile.enum'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(
      private readonly reflector: Reflector,
      private readonly configService: ConfigService,
   ) {}

   canActivate(context: ExecutionContext): boolean {
      const request: Request = context.switchToHttp().getRequest()
      const authHeader = request.headers.authorization

      if (!authHeader) {
         throw new UnauthorizedException('Token manquant')
      }

      const token = authHeader.split(' ')[1] // Format "Bearer <token>"
      if (!token) {
         throw new UnauthorizedException('Format du token invalide')
      }

      try {
         // Décoder le token sans vérification pour extraire le rôle
         const decodedHeader: any = jwt.decode(token)
         if (!decodedHeader || !decodedHeader.role) {
            throw new UnauthorizedException('Rôle non spécifié dans le token')
         }

         // Sélectionner la clé secrète en fonction du rôle
         let secretKey: string
         switch (decodedHeader.role) {
            case UserRole.CLIENT:
               secretKey = this.configService.get<string>('JWT_SECRET_CLIENT')
               break
            case UserRole.DRIVER:
               secretKey = this.configService.get<string>('JWT_SECRET_DRIVER')
               break
            case UserRole.ADMIN:
               secretKey = this.configService.get<string>('JWT_SECRET_ADMIN')
               break
            case UserRole.SELLER:
               secretKey = this.configService.get<string>('JWT_SECRET_SELLER')
               break
            default:
               throw new UnauthorizedException(
                  `Rôle invalide: ${decodedHeader.role}`,
               )
         }

         // Vérification du token avec la bonne clé secrète
         const decoded: any = jwt.verify(token, secretKey)

         // Ajouter l'utilisateur au request
         request['user'] = decoded

         // Vérifier le rôle de l'utilisateur
         const requiredRoles = this.reflector.get<string[]>(
            'allowedRole',
            context.getHandler(),
         )

         if (requiredRoles && !requiredRoles.includes(decoded.role)) {
            throw new ForbiddenException(
               `Access denied. User role: ${decoded.role}`,
            )
         }

         return true
      } catch (error) {
         console.log(error.name)

         if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedException('Token expiré')
         }
         if (error.name === 'JsonWebTokenError') {
            throw new UnauthorizedException('Token invalide')
         }
         if (error.name === 'ForbiddenException') {
            throw error
         }
         throw new UnauthorizedException('Erreur de validation du token')
      }
   }
}
