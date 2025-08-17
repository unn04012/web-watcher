import { IConfigReader } from './config.reader';

export class LlmConfig {
  constructor(private readonly _configReader: IConfigReader) {}

  get claudeApiKey() {
    const claudeApiKey = this._configReader.get('LLM_CLAUDE_API_KEY');

    if (!claudeApiKey) {
      throw new Error('LLM_CLAUDE_API_KEY is not set in the environment variables');
    }

    return claudeApiKey;
  }

  get analyzePrompt() {
    return this._configReader.getOrError('LLM_CRAWL_ANALYZE_PROMPT');
  }
}
