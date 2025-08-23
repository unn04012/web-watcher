import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './craw.controller';
import { SqsModule } from 'src/sqs/sqs.module';

@Module({
  imports: [SqsModule],
  providers: [CrawlService],
  controllers: [CrawlController],
})
export class CrawlModule {}
