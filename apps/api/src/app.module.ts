import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { SqsModule } from './sqs/sqs.module';
import { CrawlModule } from './crawl/crawl.module';

@Module({
  imports: [ConfigModule, SqsModule, CrawlModule],
})
export class AppModule {}
