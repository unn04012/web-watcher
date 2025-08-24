import { Inject } from '@nestjs/common';
import { IConfigReader } from '@web-watcher/shared';
import { Symbols } from 'constants/symbols';

export class SQSConfig {
  private readonly _queueUrl: string;
  private readonly _region: string;
  constructor(@Inject(Symbols.configReader) private readonly _configReader: IConfigReader) {
    this._queueUrl = this._configReader.getOrError('SQS_QUEUE_URL');
    this._region = this._configReader.getOrDefault('SQS_REGION', 'ap-northeast-2');
  }

  get queueUrl(): string {
    return this._queueUrl;
  }
  get region(): string {
    return this._region;
  }
}
