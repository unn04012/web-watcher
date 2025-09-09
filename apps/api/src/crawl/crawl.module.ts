import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { WebWatcherSqsModule } from 'src/sqs/sqs.module';

@Module({
  imports: [WebWatcherSqsModule],
  providers: [CrawlService],
  controllers: [CrawlController],
})
export class CrawlModule {}
