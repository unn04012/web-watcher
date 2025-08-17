import Anthropic from '@anthropic-ai/sdk';

import { CrawlResult } from '@web-watcher/shared';
import { LlmConfig } from '../../config/llm.config';
import { ContentAnalyzeRequest, IContentAnalyzer } from './content-analyzer.interface';
import { LLMAnalysis } from './llm/llm-analysis';

export class ContentAnalyzerClaude implements IContentAnalyzer {
  private readonly _client: Anthropic;

  constructor(private readonly llmConfig: LlmConfig) {
    this._client = new Anthropic({
      apiKey: this.llmConfig.claudeApiKey,
    });
  }

  public async analyzeContent({ html, url, crawlId }: ContentAnalyzeRequest): Promise<LLMAnalysis> {
    const truncatedHtml = this._truncateHtml(html, 10000);

    const prompt = this._getHtmlAnalyzePrompt(url, truncatedHtml);

    const response = await this._client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    });

    //TODO log by logger module
    console.log(response);

    const llmAnalysis = LLMAnalysis.fromClaudeResponse(crawlId, response);

    return llmAnalysis;
  }

  private _truncateHtml(html: string, maxLength: number): string {
    if (html.length <= maxLength) return html;

    // 적절한 위치에서 자르기 (태그 중간에서 자르지 않도록)
    let truncated = html.substring(0, maxLength);
    const lastTagStart = truncated.lastIndexOf('<');
    const lastTagEnd = truncated.lastIndexOf('>');

    if (lastTagStart > lastTagEnd) {
      truncated = truncated.substring(0, lastTagStart);
    }

    return truncated + '...';
  }

  getSummary(crawlResult: CrawlResult): string {
    throw new Error('Method not implemented.');
  }
  getKeywords(crawlResult: CrawlResult): string[] {
    throw new Error('Method not implemented.');
  }
  getCategories(crawlResult: CrawlResult): string[] {
    throw new Error('Method not implemented.');
  }

  private _getHtmlAnalyzePrompt(url: string, html: string) {
    const promptPrefix = `
URL: ${url}
HTML (일부):
${html}`;

    const prompt = `${promptPrefix}\n${this.llmConfig.analyzePrompt}`;

    return prompt;
  }
}
