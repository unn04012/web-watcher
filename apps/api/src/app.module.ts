import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { CrawlModule } from './crawl/crawl.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { WebWatcherSqsModule } from './sqs/sqs.module';

@Module({
  imports: [ConfigModule, CrawlModule, WebWatcherSqsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
