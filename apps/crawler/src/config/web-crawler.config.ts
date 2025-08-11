import { IConfigReader } from './config.reader';

export class WebCrawlerConfig {
  constructor(private readonly _configReader: IConfigReader) {}

  get headless(): boolean {
    const headless = this._configReader.getOrDefault('WEB_CRAWLER_HEADLESS', 'true');

    return Boolean(headless);
  }
}
