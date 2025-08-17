import { CrawlDto, CrawlResult } from '@web-watcher/shared';
import { CrawlDynamoItem, CrawlProps, CrawlStatus } from './crawl.types';
import { LLMAnalysis } from '../analyzer/llm/llm-analysis';

export class Crawl {
  private readonly _id: string;
  private readonly _jobId: string;
  private readonly _url: string;
  private readonly _name: string;
  private readonly _description?: string;
  private readonly _tags: string[];
  private readonly _keywords: string[];
  private readonly _categoryFilters: string[];
  private readonly _createdAt: Date;
  private readonly _status: CrawlStatus;
  private readonly _result?: CrawlResult;
  private readonly _errorMessage?: string;

  private _llmAnalysis?: LLMAnalysis;
  private _updatedAt: Date;

  private constructor(props: CrawlProps) {
    this._id = props.id;
    this._jobId = props.jobId;
    this._url = props.url;
    this._name = props.name;
    this._description = props.description;
    this._tags = props.tags || [];
    this._keywords = props.keywords;
    this._categoryFilters = props.categoryFilters;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._status = props.status;
    this._result = props.result;
    this._errorMessage = props.errorMessage;
    this._llmAnalysis = props.llmAnalysis;
  }

  static fromCrawlRequest(dto: CrawlDto): Crawl {
    const now = new Date();
    const id = `crawl_${dto.jobId}_${Date.now()}`;

    return new Crawl({
      id,
      jobId: dto.jobId,
      url: dto.url,
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      keywords: dto.keyword,
      categoryFilters: dto.categoryFilters,
      createdAt: now,
      updatedAt: now,
      status: CrawlStatus.PENDING,
    });
  }

  static fromDynamoDBItem(item1: any, llmAnalysis?: any) {
    return new Crawl({
      ...item1,
      llmAnalysis,
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get jobId(): string {
    return this._jobId;
  }
  get url(): string {
    return this._url;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get tags(): string[] {
    return [...this._tags]; // 배열 복사본 반환
  }
  get keywords(): string[] {
    return [...this._keywords]; // 배열 복사본 반환
  }
  get categoryFilters(): string[] {
    return [...this._categoryFilters]; // 배열 복사본 반환
  }
  get status(): CrawlStatus {
    return this._status;
  }
  get result(): CrawlResult | undefined {
    return this._result;
  }
  get errorMessage(): string | undefined {
    return this._errorMessage;
  }
  get llmAnalysis(): LLMAnalysis | undefined {
    return this._llmAnalysis;
  }

  set llmAnalysis(analysis: LLMAnalysis) {
    this._llmAnalysis = analysis;
    this._updatedAt = new Date();
  }

  public markAsCompleted(result: CrawlResult): Crawl {
    return new Crawl({
      ...this.toProps(),
      status: CrawlStatus.COMPLETED,
      result,
      updatedAt: new Date(),
    });
  }

  public markAsFailed(errorMessage: string): Crawl {
    return new Crawl({
      ...this.toProps(),
      status: CrawlStatus.FAILED,
      errorMessage,
      updatedAt: new Date(),
    });
  }

  public completeLLMAnalysis(analysis: LLMAnalysis): Crawl {
    if (!this._llmAnalysis) {
      throw new Error('LLM analysis not started');
    }
    return new Crawl({
      ...this.toProps(),
      llmAnalysis: analysis,
      updatedAt: new Date(),
    });
  }

  public toDynamoItem(): CrawlDynamoItem {
    return {
      PK: `JOB#${this._jobId}`,
      SK: `CRAWL#${this._id}`,
      id: this._id,
      jobId: this._jobId,
      url: this._url,
      name: this._name,
      description: this._description,
      tags: this._tags,
      keywords: this._keywords,
      categoryFilters: this._categoryFilters,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      status: this._status,
      result: this._result ? JSON.stringify(this._result) : undefined,
      errorMessage: this._errorMessage,
      // llmAnalysis: this._llmAnalysis ? JSON.stringify(this._llmAnalysis.toJSON()) : undefined,
      GSI1PK: `JOB#${this._jobId}`,
      GSI1SK: `CRAWL#${this._createdAt.toISOString()}`,
    };
  }

  private toProps(): CrawlProps {
    return {
      id: this._id,
      jobId: this._jobId,
      url: this._url,
      name: this._name,
      description: this._description,
      tags: this._tags,
      keywords: this._keywords,
      categoryFilters: this._categoryFilters,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status,
      result: this._result,
      errorMessage: this._errorMessage,
      llmAnalysis: this._llmAnalysis,
    };
  }
}
