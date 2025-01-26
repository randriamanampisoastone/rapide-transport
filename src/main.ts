import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
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
   await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
