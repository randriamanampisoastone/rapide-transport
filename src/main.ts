import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import {ValidationPipe} from '@nestjs/common'
import {RedisIoAdapter} from './redis/redis-io.adaptater'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const redisIoAdapter = new RedisIoAdapter(app)
    await redisIoAdapter.connectToRedis()
    app.useWebSocketAdapter(redisIoAdapter)
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
            enableImplicitConversion: true
        }
    }))
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: '*',
        credentials: true,
    })

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('Rapide App API')
        .setDescription('Rapide app API for RIDE/RENT/MART/FOOD/EXPRESS')
        .setVersion('1.0')
        .addBearerAuth() // For JWT authentication
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Add this: Create endpoint for downloading API docs
    app.getHttpAdapter().get('/api/docs', (req, res) => {
        res.header('Content-Type', 'application/json');
        res.header('Content-Disposition', 'attachment; filename=api-docs.json');
        res.send(JSON.stringify(document, null, 2));
    });

    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
