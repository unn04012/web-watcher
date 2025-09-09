import { Controller, Post } from '@nestjs/common';
import { StartCrawlDto } from './dto/crawl.dto';
import { CrawlService } from './crawl.service';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly _crawlService: CrawlService) {}

  @Post()
  public async registerCrawl(dto: StartCrawlDto) {
    await this._crawlService.registerCrawl(dto);
  }
}
