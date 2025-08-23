import { Inject } from '@nestjs/common';
import { IConfigReader } from '@web-watcher/shared';
import { Symbols } from 'constants/symbols';

export class SQSConfig {
  constructor(@Inject(Symbols.configReader) private readonly _configReader: IConfigReader) {}

  get queueUrl(): string {
    return this._configReader.getOrError('SQS_QUEUE_URL');
  }
  get region(): string {
    return this._configReader.getOrDefault('SQS_REGION', 'ap-northeast-2');
  }
}
