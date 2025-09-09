import { Injectable } from '@nestjs/common';
import { StartCrawlDto } from './dto/crawl.dto';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@ssut/nestjs-sqs/dist/sqs.types';
import { WebWatcherSqsService } from 'src/sqs/sqs.service';

const crawlQueue = <string>process.env.CRAWL_QUEUE_NAME;
@Injectable()
export class CrawlService {
  constructor(private readonly _sqsService: WebWatcherSqsService) {}

  /**
   * 크롤링 작업 등록
   * @param dto
   */
  async registerCrawl(dto: StartCrawlDto) {
    const jobId = crypto.randomUUID();

    //TODO save to db

    await this._sqsService.sendCrawlQueue({
      ...dto,
      jobId,
      name: `crawl-request-${jobId}`,
      categoryFilters: [],
    });
  }

  @SqsMessageHandler(crawlQueue)
  public async handleCrawlQueueMessage(message: Message) {
    const payload = JSON.parse(message.body);
    // 메시지 처리 로직을 여기에 추가
  }
}
