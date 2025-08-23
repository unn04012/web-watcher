import { Inject } from '@nestjs/common';
import { IConfigReader } from '@web-watcher/shared';
import { Symbols } from 'constants/symbols';

export class AppConfig {
  constructor(@Inject(Symbols.configReader) private readonly _configReader: IConfigReader) {}

  get port() {
    return Number(this._configReader.getOrDefault('API_PORT', '3000'));
  }
}
