import { IConfigReader } from './config.reader';

export class SqsConfig {
  constructor(private readonly _configReader: IConfigReader) {}

  get queueUrl(): string {
    return this._configReader.getOrError('SQS_QUEUE_URL');
  }

  get region(): string {
    const region = this._configReader.getOrDefault('SQS_REGION', 'ap-northeast-2');
    return region;
  }
}
