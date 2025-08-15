import { Browser, chromium } from 'playwright';
import { CrawlDto } from '@web-watcher/shared';
import { IWebCrawler } from './web-crawler.interface';
import { WebCrawlerConfig } from '../config/web-crawler.config';

export class WebCrawlerPlaywright implements IWebCrawler {
  private _browser: Browser | null = null;

  constructor(private readonly _webCrawlerConfig: WebCrawlerConfig) {}

  public async initialize(): Promise<void> {
    if (!this._browser) {
      this._browser = await chromium.launch({
        headless: this._webCrawlerConfig.headless,

        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled', // 중요!
          '--disable-extensions-except=/path/to/ublock',
          '--disable-extensions',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-client-side-phishing-detection',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-hang-monitor',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-report-upload',
          '--disable-component-update',
        ],

        // 실제 브라우저처럼 보이게 하는 설정
        slowMo: 100, // 액션 사이에 딜레이 추가
      });
    }
  }

  public async crawlPage(url: string): Promise<string> {
    if (!this._browser) {
      await this.initialize();
    }

    const page = await this._browser!.newPage();

    // 페이지 설정
    await page.setViewportSize({ width: 1280, height: 720 });
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // 페이지 로드
    await page.goto(url, { waitUntil: 'networkidle' });

    // 기본 정보 추출
    // const title = await page.title();
    const rawHtml = await page.content();

    console.log('raw html: ', rawHtml);

    return rawHtml;
  }

  getLinks(): string[] {
    throw new Error('Method not implemented.');
  }
  getContent(): string {
    throw new Error('Method not implemented.');
  }
  analyzeContent(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
