import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
   const app = await NestFactory.create(AppModule)
   app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
   app.enableCors({
      origin: '*', // Autorise toutes les origines
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Autorise toutes les méthodes HTTP
      allowedHeaders: '*', // Autorise tous les en-têtes
      credentials: true, // Autoriser les credentials (cookies, etc.)
   })
   await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
