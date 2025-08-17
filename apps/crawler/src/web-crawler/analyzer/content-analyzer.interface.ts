import { CrawlResult } from '@web-watcher/shared';
import { LLMAnalysis } from './llm/llm-analysis';

export type ContentAnalyze = {
  uniqueId: string; // post identifier
  title: string;
  content: string;
  link: string;
  publishedAt: string | null;
  category: string | null;
  position: string | null;
  additionalInfo: {
    deadline?: string;
    viewCount?: number;
    participants?: number;
    tags?: string[];
  };
};

export type ContentAnalyzeResult = {
  siteType: string;
  totalPosts: number;
  posts: ContentAnalyze[];
  confidence: number; // LLM이 자신의 분석 결과에 대해 얼마나 확신하는지를 나타내는 신뢰도 점수
  extractionNotes: string;
};

export type ContentAnalyzeRequest = {
  html: string; // 웹 페이지의 HTML 콘텐츠
  url: string; // 웹 페이지의 URL
  crawlId: string; // 크롤링 요청 ID
};
export interface IContentAnalyzer {
  analyzeContent({ html, url, crawlId }: ContentAnalyzeRequest): Promise<LLMAnalysis>;

  getSummary(crawlResult: CrawlResult): string;
  getKeywords(crawlResult: CrawlResult): string[];
  getCategories(crawlResult: CrawlResult): string[];
}
