import { Inject } from '@nestjs/common';
import { IConfigReader } from '@web-watcher/shared';
import { Symbols } from 'constants/symbols';

export class SQSConfig {
  private readonly _crawlQueueName: string;
  private readonly _crawlQueueUrl: string;
  private readonly _crawlResultQueueName: string;
  private readonly _crawlResultQueueUrl: string;
  private readonly _region: string;

  constructor(@Inject(Symbols.configReader) private readonly _configReader: IConfigReader) {
    this._crawlQueueName = this._configReader.getOrError('SQS_CRAWL_QUEUE_NAME');
    this._crawlQueueUrl = this._configReader.getOrError('SQS_CRAWL_QUEUE_URL');
    this._crawlResultQueueName = this._configReader.getOrError('SQS_CRAWL_RESULT_QUEUE_NAME');
    this._crawlResultQueueUrl = this._configReader.getOrError('SQS_CRAWL_RESULT_QUEUE_URL');
    this._region = this._configReader.getOrDefault('SQS_REGION', 'ap-northeast-2');
  }

  get crawlQueueUrl(): string {
    return this._crawlQueueUrl;
  }

  get crawlResultQueueUrl(): string {
    return this._crawlResultQueueUrl;
  }

  get crawlQueueName(): string {
    return this._crawlQueueName;
  }

  get crawlResultQueueName(): string {
    return this._crawlResultQueueName;
  }

  get region(): string {
    return this._region;
  }
}
