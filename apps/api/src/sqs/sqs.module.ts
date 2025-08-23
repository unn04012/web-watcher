import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { SqsService } from './sqs.service';

@Module({
  imports: [ConfigModule],
  providers: [SqsService],
  exports: [SqsService],
})
export class SqsModule {}
