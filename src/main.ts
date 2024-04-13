import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { WebsocketAdapter } from '#adapters/socket.adapter';
import { JwtAuthGuard } from '#auth/guards/jwt.guard';
import { HttpExceptionFilter } from '#utils/filters';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);

  const httpAdapter = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-type', 'Accept'],
    methods: ['PUT', 'POST', 'DELETE', 'GET', 'OPTIONS'],
  });
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Sinbook')
    .setDescription('The sinbook api description')
    .setVersion('1.0')
    .addTag('sinbook api')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.useWebSocketAdapter(new WebsocketAdapter(app));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.listen(5555);
}

bootstrap();
