import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './environment-variables';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const configService = app.get(ConfigService<EnvironmentVariables, true>);

  const config = new DocumentBuilder()
    .setTitle('REAL-TIME-CHAT')
    .setDescription('real-time-chat-API')
    .setVersion('1.0')
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: 'http://localhost:3000', // Укажите здесь домен вашего фронтенда
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Укажите методы, которые разрешены
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
  });

  await app.listen(configService.get<number>('PORT') || 3000);
  console.log(`server ok PORT ${configService.get<number>('PORT') || 3000}`);
}
bootstrap();
