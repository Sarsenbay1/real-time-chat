import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './environment-variables';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const configService = app.get(ConfigService<EnvironmentVariables, true>);

  // const config=new

  // app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(configService.get<number>('PORT') || 3000);
  console.log(`server ok PORT ${configService.get<number>('PORT') || 3000}`);
}
bootstrap();
