import { Global, Module } from '@nestjs/common';
import { AppConfig } from './app.config';
import { readConfig } from '@web-watcher/shared';
import { Symbols } from 'constants/symbols';

@Global()
@Module({
  providers: [
    {
      provide: Symbols.configReader,
      useFactory: () => readConfig(process.env),
    },
    AppConfig,
  ],
  exports: [AppConfig],
})
export class ConfigModule {}
