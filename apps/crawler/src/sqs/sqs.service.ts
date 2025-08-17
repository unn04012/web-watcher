import { SendMessageCommand, SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import { SqsConfig } from '../config/sqs.config';

export class SqsService {
  private readonly _sqsClient: SQSClient;
  constructor(private readonly sqsConfig: SqsConfig) {
    this._sqsClient = new SQSClient({
      region: this.sqsConfig.region,
    });
  }

  public async sendMessage(message: object) {
    const messageBody = JSON.stringify(message);
    const input: SendMessageRequest = {
      QueueUrl: this.sqsConfig.queueUrl,
      MessageBody: messageBody,
    };

    const command = new SendMessageCommand(input);

    await this._sqsClient.send(command);

    //TODO logging by logger
    console.log(`Message sent to SQS body: ${messageBody}`);
  }
}
