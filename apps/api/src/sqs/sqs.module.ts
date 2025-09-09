import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { WebWatcherSqsService } from './sqs.service';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SqsOptionFactory } from './sqs-option.factory';
import { SQSConfig } from 'src/config/sqs.config';

@Module({
  imports: [
    ConfigModule,
    SqsModule.registerAsync({
      useFactory: SqsOptionFactory,
      inject: [SQSConfig],
    }),
  ],
  providers: [WebWatcherSqsService],
  exports: [WebWatcherSqsService],
})
export class WebWatcherSqsModule {}
