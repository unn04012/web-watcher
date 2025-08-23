import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from 'src/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(AppConfig);

  await app.listen(appConfig.port, () => {
    console.log(`API server is running on http://localhost:${appConfig.port}`);
  });
}
bootstrap();
