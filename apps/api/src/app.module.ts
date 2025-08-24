import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { SqsModule } from './sqs/sqs.module';
import { CrawlModule } from './crawl/crawl.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, SqsModule, CrawlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
