import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from 'src/config/app.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 자동으로 DTO에 없는 속성 제거
      transform: true, // 요청 데이터를 DTO 타입으로 변환
    })
  );

  const appConfig = app.get(AppConfig);

  await app.listen(appConfig.port, () => {
    console.log(`API server is running, port: ${appConfig.port}`);
  });
}
bootstrap();
