import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetUser = createParamDecorator(
   (key: string, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest()
      const user = request.user // `req.user` est défini par le JWT Auth Guard

      return key ? user?.[key] : user // Retourne `sub` ou tout l'objet user si aucune clé spécifique n'est demandée
   },
)
