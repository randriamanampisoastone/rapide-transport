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
    app.useGlobalPipes(new ValidationPipe({transform: true, whitelist: true}))
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: '*',
        credentials: true,
    })

    // For Swagger UI protection, use basic auth middleware
    const swaggerUser = process.env.SWAGGER_USER || 'admin';
    const swaggerPassword = process.env.SWAGGER_PASSWORD || 'password';

    // Apply basic auth middleware before swagger setup
    app.use('/api', (req, res, next) => {
        const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
        const [user, password] = Buffer.from(b64auth, 'base64').toString().split(':');

        if (user && password && user === swaggerUser && password === swaggerPassword) {
            return next();
        }

        res.set('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).send('Authentication required');
    });

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('Rapide App API')
        .setDescription('Rapide app API for RIDE/RENT/MART/FOOD/EXPRESS')
        .setVersion('1.0')
        .addTag('e-commerce')
        .addBearerAuth() // For JWT authentication
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
