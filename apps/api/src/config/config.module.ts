import { Global, Module } from '@nestjs/common';
import { AppConfig } from './app.config';
import { readConfig } from '@web-watcher/shared';
import { Symbols } from 'constants/symbols';
import { SQSConfig } from './sqs.config';

@Global()
@Module({
  providers: [
    {
      provide: Symbols.configReader,
      useFactory: () => readConfig(process.env),
    },
    AppConfig,
    SQSConfig,
  ],
  exports: [AppConfig, SQSConfig],
})
export class ConfigModule {}
