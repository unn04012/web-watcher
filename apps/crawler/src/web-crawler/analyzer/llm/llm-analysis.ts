import crypto from 'node:crypto';

import { LLMAnalysisProps, LlmContent, LLMMetadata } from './llm-analysis.types';
import { Message } from '@anthropic-ai/sdk/resources/messages';
import { ContentAnalyzeResult } from '../content-analyzer.interface';

export class LLMAnalysis {
  private readonly _id: string;
  private readonly _crawlId: string;
  private readonly _type: string;
  private readonly _model: string;
  private readonly _content: LlmContent[];
  private readonly _stopReason: string | null;
  private readonly _stopSequence: string | null;
  private readonly _llmMetadata: LLMMetadata;
  private readonly _createdAt: Date;
  private readonly _errorMessage?: string;

  /**
   * jobId from crawl request
   */
  private _jobId: string;

  private constructor(props: LLMAnalysisProps) {
    this._id = props.id;
    this._crawlId = props.crawlId;
    this._type = props.type;
    this._model = props.model;
    this._content = props.content;
    this._stopReason = props.stopReason;
    this._stopSequence = props.stopSequence;
    this._llmMetadata = props.llmMetadata;
    this._createdAt = props.createdAt;
    this._errorMessage = props.errorMessage;
  }

  static fromClaudeResponse(crawlId: string, llmResponse: Message): LLMAnalysis {
    return new LLMAnalysis({
      id: crypto.randomUUID(),
      crawlId,
      type: llmResponse.type,
      model: llmResponse.model,
      stopReason: llmResponse.stop_reason,
      stopSequence: llmResponse.stop_sequence,
      content: llmResponse.content as LlmContent[],
      llmMetadata: {
        id: llmResponse.id,
        model: llmResponse.model,
        usage: {
          inputTokens: llmResponse.usage.input_tokens,
          cacheCreationInputTokens: llmResponse.usage.cache_creation_input_tokens,
          cacheReadInputTokens: llmResponse.usage.cache_read_input_tokens,
          outputTokens: llmResponse.usage.output_tokens,
        },
        stopReason: llmResponse.stop_reason,
        stopSequence: llmResponse.stop_sequence,
      },
      createdAt: new Date(),
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get crawlId(): string {
    return this._crawlId;
  }
  get llmMetadata(): LLMMetadata {
    return this._llmMetadata;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get errorMessage(): string | undefined {
    return this._errorMessage;
  }
  get inputTokens(): number {
    return this._llmMetadata.usage.inputTokens;
  }
  get outputTokens(): number {
    return this._llmMetadata.usage.outputTokens;
  }
  get totalTokens(): number {
    return this.inputTokens + this.outputTokens;
  }

  set jobId(jobId: string) {
    this._jobId = jobId;
  }

  static fromDynamoDBItem(item: any): LLMAnalysis {
    return new LLMAnalysis({
      id: item.id,
      crawlId: item.crawlId,
      type: item.type,
      model: item.model,
      content: typeof item.content === 'string' ? JSON.parse(item.content) : item.content,
      stopReason: item.stopReason,
      stopSequence: item.stopSequence,
      llmMetadata: typeof item.llmMetadata === 'string' ? JSON.parse(item.llmMetadata) : item.llmMetadata,
      createdAt: new Date(item.createdAt),
      errorMessage: item.errorMessage,
    });
  }

  public toDynamoDBItem() {
    if (!this._jobId) throw new Error('Job ID is not set for LLMAnalysis');

    return {
      PK: `CRAWL#${this._crawlId}`,
      SK: `ANALYSIS#${this._id}`,
      GSI1PK: `JOB#${this._jobId}`,
      GSI1SK: `ANALYSIS#${this._createdAt.toISOString()}`,
      id: this._id,
      crawlId: this._crawlId,
      type: this._type,
      model: this._model,
      content: JSON.stringify(this._content),
      stopReason: this._stopReason,
      stopSequence: this._stopSequence,
      llmMetadata: JSON.stringify(this._llmMetadata),
      createdAt: this._createdAt.toISOString(),
      errorMessage: this._errorMessage,
    };
  }

  private toProps(): LLMAnalysisProps {
    return {
      id: this._id,
      crawlId: this._crawlId,
      type: this._type,
      model: this._model,
      content: this._content,
      stopReason: this._stopReason,
      stopSequence: this._stopSequence,
      llmMetadata: this._llmMetadata,
      createdAt: this._createdAt,
      errorMessage: this._errorMessage,
    };
  }

  /**
   * llm에서 크롤링 한 결과를 분석한 analyze content를 가져옵니다.
   * @returns
   */
  public getAnalyzeContent(): ContentAnalyzeResult {
    const content = this._content.map((item) => {
      // validate json string format
      return JSON.parse(item.text);
    });

    return content[0];
    // return JSON.parse();
  }
}
