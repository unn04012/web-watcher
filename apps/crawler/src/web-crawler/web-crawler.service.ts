import { CrawlDto } from '@web-watcher/shared';
import { IWebCrawler } from './web-crawler.interface';
import { IContentAnalyzer } from './analyzer/content-analyzer.interface';
import { Crawl } from './crawl/crawl';
import { ICrawlRepository } from './repository/crawl.repository.interface';
import { SqsService } from '../sqs/sqs.service';

export class WebCrawlerService {
  constructor(
    private readonly _webCrawler: IWebCrawler,
    private readonly _crawlerAnalyzer: IContentAnalyzer,
    private _crawlRepository: ICrawlRepository,
    private readonly sqsService: SqsService
  ) {}

  public async startCrawl(dto: CrawlDto) {
    const crawl = Crawl.fromCrawlRequest(dto);

    const crawlResult = await this._webCrawler.crawlPage(crawl.url);

    const analyzedResult = await this._crawlerAnalyzer.analyzeContent({
      html: crawlResult,
      url: crawl.url,
      crawlId: crawl.id,
    });

    analyzedResult.jobId = dto.jobId;
    crawl.llmAnalysis = analyzedResult;

    await this._crawlRepository.save(crawl);

    await this.sqsService.sendMessage(analyzedResult.getAnalyzeContent());
  }
}
