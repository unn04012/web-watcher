import { Crawl } from '../crawl/crawl';

export interface ICrawlRepository {
  /**
   * insert of update crawl
   */
  save(crawl: Crawl): Promise<Crawl>;
}
