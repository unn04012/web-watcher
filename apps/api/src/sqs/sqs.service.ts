import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { CrawlDto } from '@web-watcher/shared';
import { SQSConfig } from 'src/config/sqs.config';

@Injectable()
export class WebWatcherSqsService {
  constructor(private readonly _sqsConfig: SQSConfig, private readonly _sqsService: SqsService) {}

  /**
   * 크롤링 작업 요청을 SQS 큐에 전송합니다.
   */
  public async sendCrawlQueue(message: CrawlDto) {
    await this._sendMessage({
      id: message.jobId,
      message: JSON.stringify(message),
      queueName: this._sqsConfig.crawlQueueName,
    });
  }

  private async _sendMessage({ id, queueName, message }: { id: string; queueName: string; message: string }) {
    await this._sqsService.send(queueName, {
      id,
      body: message,
    });
  }
}
