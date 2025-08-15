import { CrawlResult } from '@web-watcher/shared/index';
import { LLMAnalysis } from '../analyzer/llm/llm-analysis';

export enum CrawlStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface CrawlProps {
  id: string;
  jobId: string;
  url: string;
  name: string;
  description?: string;
  tags?: string[];
  keywords: string[];
  categoryFilters: string[];
  createdAt: Date;
  updatedAt: Date;
  status: CrawlStatus;
  result?: CrawlResult;
  errorMessage?: string;
  llmAnalysis?: LLMAnalysis;
}

export interface CrawlDynamoItem {
  PK: string;
  SK: string;
  id: string;
  jobId: string;
  url: string;
  name: string;
  description?: string;
  tags: string[];
  keywords: string[];
  categoryFilters: string[];
  createdAt: string;
  updatedAt: string;
  status: CrawlStatus;
  result?: string;
  errorMessage?: string;
  llmAnalysis?: string; // JSON stringified LLMAnalysis
  GSI1PK: string;
  GSI1SK: string;
}
