import { ContentAnalyzeResult } from '../content-analyzer.interface';

export interface LLMAnalysisProps {
  id: string;
  crawlId: string;
  type: string;
  model: string;
  content: LlmContent[];
  stopReason: string | null;
  stopSequence: string | null;
  llmMetadata: LLMMetadata;
  createdAt: Date;
  errorMessage?: string;
}

export interface LLMAnalysisJSON {
  analysisResult: ContentAnalyzeResult;
  llmMetadata: LLMMetadata;
  createdAt: string;
  errorMessage?: string;
}

export interface LLMMetadata {
  id: string;
  model: string;
  usage: {
    inputTokens: number;
    cacheCreationInputTokens: number | null;
    cacheReadInputTokens: number | null;
    outputTokens: number;
  };
  stopReason: string | null;
  stopSequence: string | null;
}

export type LlmContent = {
  type: 'text' | 'image' | 'video';
  text: string;
};

export interface LLMResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: LlmContent[];
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    output_tokens: number;
    service_tier: string;
  };
}
