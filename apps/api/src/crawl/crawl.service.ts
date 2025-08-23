import { Injectable } from '@nestjs/common';
import { StartCrawlDto } from './dto/crawl.dto';
import { SqsService } from 'src/sqs/sqs.service';

@Injectable()
export class CrawlService {
  constructor(private readonly _sqsService: SqsService) {}

  async startCrawl(dto: StartCrawlDto) {
    const jobId = crypto.randomUUID();

    //TODO save to db

    await this._sqsService.requestForCrawl({
      ...dto,
      jobId,
      name: `crawl-request-${jobId}`,
      categoryFilters: [],
    });
  }
}
