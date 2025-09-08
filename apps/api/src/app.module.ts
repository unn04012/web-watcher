import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { CrawlModule } from './crawl/crawl.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SQSConfig } from './config/sqs.config';

@Module({
  imports: [
    ConfigModule,
    CrawlModule,
    SqsModule.registerAsync({
      useFactory: (config: SQSConfig) => ({
        consumer: [
          {
            name: config.crawlQueueName,
            queueUrl: config.crawlQueueUrl,
            region: config.region,
          },
          {
            name: config.crawlResultQueueName,
            queueUrl: config.crawlResultQueueUrl,
            region: config.region,
          },
        ],
        producers: [
          {
            name: config.crawlQueueName,
            queueUrl: config.crawlQueueUrl,
            region: config.region,
          },
        ],
      }),
      inject: [SQSConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
