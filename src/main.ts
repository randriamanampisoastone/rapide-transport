import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { RedisIoAdapter } from './redis/redis-io.adaptater'

async function bootstrap() {
   const app = await NestFactory.create(AppModule)
   const redisIoAdapter = new RedisIoAdapter(app)
   await redisIoAdapter.connectToRedis()
   app.useWebSocketAdapter(redisIoAdapter)
   app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
   app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: '*',
      credentials: true,
   })

   // Swagger configuration
   const config = new DocumentBuilder()
      .setTitle('E-commerce API')
      .setDescription('The E-commerce API documentation')
      .setVersion('1.0')
      .addTag('e-commerce')
      .addBearerAuth() // For JWT authentication
      .build();

   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api', app, document);

   await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
