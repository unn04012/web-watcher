export type Html = string;

export interface IWebCrawler {
  /**
   *
   * @param url
   */
  crawlPage(url: string): Promise<Html>;
  getLinks(): string[];
  getContent(): string;
  analyzeContent(): Promise<any>;
}
