import { SqsOptions } from '@ssut/nestjs-sqs/dist/sqs.types';
import { SQSConfig } from 'src/config/sqs.config';

export function SqsOptionFactory(config: SQSConfig): SqsOptions {
  return {
    consumers: [
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
  };
}
