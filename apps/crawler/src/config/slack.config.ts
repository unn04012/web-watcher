import { IConfigReader } from './config.reader';

export class SlackConfig {
  constructor(private readonly _configReader: IConfigReader) {}

  get slackWebhookUrl() {
    return this._configReader.getOrError('SLACK_WEBHOOK_URL');
  }
}
