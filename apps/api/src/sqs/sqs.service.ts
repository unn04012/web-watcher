import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { CrawlDto } from '@web-watcher/shared';
import { SQSConfig } from 'src/config/sqs.config';

@Injectable()
export class SqsService {
  private readonly _sqsClient: SQSClient;

  constructor(private readonly _sqsConfig: SQSConfig) {
    this._sqsClient = new SQSClient({ region: this._sqsConfig.region });
  }

  public async requestForCrawl(dto: CrawlDto) {
    await this._sendMessage(JSON.stringify(dto));
  }

  private async _sendMessage(messageBody: string): Promise<void> {
    const queueUrl = this._sqsConfig.queueUrl;

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    });

    await this._sqsClient.send(command);
  }
}
