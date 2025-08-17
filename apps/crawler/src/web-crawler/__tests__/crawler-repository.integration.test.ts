import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { CrawlRepositoryDynamoDB } from '../repository/crawl.repository.dynamodb';
import { DynamoDBConfig } from '../../config/dynamodb.config';
import { IConfigReader } from '../../config/config.reader';
import { Crawl } from '../crawl/crawl';
import { CrawlDto } from '@web-watcher/shared';
import { CrawlStatus } from '../crawl/crawl.types';
import { LLMAnalysis } from '../analyzer/llm/llm-analysis';
import { Message } from '@anthropic-ai/sdk/resources/index.mjs';

class TestConfigReader implements IConfigReader {
  private config = new Map<string, string>([
    ['DYNAMODB_TABLE_NAME', 'test-web-watcher-table'],
    ['DYNAMODB_REGION', 'us-east-1'],
    ['DYNAMODB_ENDPOINT', 'http://localhost:8000'],
  ]);

  get(key: string): string | undefined {
    return this.config.get(key);
  }

  getOrDefault(key: string, defaultValue: string): string {
    return this.config.get(key) ?? defaultValue;
  }

  getOrError(key: string): string {
    const value = this.config.get(key);
    if (!value) {
      throw new Error(`Config key ${key} not found`);
    }
    return value;
  }
}

describe('CrawlRepositoryDynamoDB Integration Tests', () => {
  let repository: CrawlRepositoryDynamoDB;
  let dynamoClient: DynamoDBClient;
  let config: DynamoDBConfig;

  beforeAll(async () => {
    const configReader = new TestConfigReader();
    config = new DynamoDBConfig(configReader);

    dynamoClient = new DynamoDBClient({
      region: config.region,
      endpoint: config.endpoint,
    });

    repository = new CrawlRepositoryDynamoDB(config);

    // Create test table

    await createTestTable();
  });

  afterAll(async () => {
    // Clean up test table
    // await deleteTestTable();
    dynamoClient.destroy();
  });

  async function createTestTable() {
    try {
      await dynamoClient.send(
        new CreateTableCommand({
          TableName: config.tableName,
          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'GSI1',
              KeySchema: [
                { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
            },
          ],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        })
      );

      // Wait for table to be active
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      if ((error as Error).name !== 'ResourceInUseException') {
        throw error;
      }
    }
  }

  async function deleteTestTable() {
    try {
      await dynamoClient.send(
        new DeleteTableCommand({
          TableName: config.tableName,
        })
      );
    } catch (error) {
      console.warn('Failed to delete test table:', error);
    }
  }

  describe('save()', () => {
    it('should save a new crawl successfully', async () => {
      const crawlDto: CrawlDto = {
        jobId: 'test-job-1',
        url: 'https://example.com',
        name: 'Test Crawl',
        description: 'Test description',
        tags: ['test', 'integration'],
        keyword: ['web', 'crawl'],
        categoryFilters: ['tech'],
      };

      const crawl = Crawl.fromCrawlRequest(crawlDto);

      const savedCrawl = await repository.save(crawl);

      expect(savedCrawl).toBeDefined();
      expect(savedCrawl.id).toBe(crawl.id);
      expect(savedCrawl.jobId).toBe(crawlDto.jobId);
      expect(savedCrawl.url).toBe(crawlDto.url);
      expect(savedCrawl.name).toBe(crawlDto.name);
      expect(savedCrawl.status).toBe(CrawlStatus.PENDING);
    });

    it('should throw error when trying to save duplicate crawl', async () => {
      const crawlDto: CrawlDto = {
        jobId: 'test-job-2',
        url: 'https://duplicate.com',
        name: 'Duplicate Test',
        description: 'Duplicate test description',
        tags: ['test'],
        keyword: ['duplicate'],
        categoryFilters: ['test'],
      };

      const crawl = Crawl.fromCrawlRequest(crawlDto);

      // First save should succeed
      await repository.save(crawl);

      // Second save should fail
      await expect(repository.save(crawl)).rejects.toThrow(Error);
    });

    it('save with llmAnalysis should save successfully', async () => {
      const crawlDto: CrawlDto = {
        jobId: 'test-job-4',
        url: 'https://llmanalysis.com',
        name: 'LLM Analysis Test',
        description: 'Testing LLM analysis saving',
        tags: ['llm', 'analysis'],
        keyword: ['test'],
        categoryFilters: ['ai'],
      };

      const crawl = Crawl.fromCrawlRequest(crawlDto);

      const llmMessage = <Message>{
        type: 'message',
        model: 'claude-3-5-haiku-20241022',
        stop_reason: 'end_turn',
        content: [
          {
            type: 'text',
            text: 'This is a test message for LLM analysis.',
          },
        ],
        id: 'test-message-id',
        usage: {
          input_tokens: 100,
          cache_creation_input_tokens: null,
          cache_read_input_tokens: null,
          output_tokens: 50,
        },
        stop_sequence: null,
        role: 'assistant',
      };

      const llmAnalysis = LLMAnalysis.fromClaudeResponse(crawl.id, llmMessage);

      crawl.llmAnalysis = llmAnalysis;
      llmAnalysis.jobId = crawlDto.jobId;

      await repository.save(crawl);

      const crawls = await repository.findJobCrawlsWithAnalyses(crawlDto.jobId);
      const savedCrawl = crawls.find((c) => c.id === crawl.id);

      expect(savedCrawl).not.toBeNull();

      expect(savedCrawl!.llmAnalysis).toBeDefined();
      expect(savedCrawl!.llmAnalysis?.crawlId).toBe(crawl.id);
    });
  });

  describe('findById()', () => {
    it('should find existing crawl by jobId and crawlId', async () => {
      const crawlDto: CrawlDto = {
        jobId: 'test-job-3',
        url: 'https://findme.com',
        name: 'Find Me Crawl',
        description: 'Find me description',
        tags: ['findable'],
        keyword: ['search'],
        categoryFilters: ['find'],
      };

      const originalCrawl = Crawl.fromCrawlRequest(crawlDto);
      await repository.save(originalCrawl);

      const foundCrawl = await repository.findById(originalCrawl.jobId, originalCrawl.id);

      expect(foundCrawl).toBeDefined();
      expect(foundCrawl!.id).toBe(originalCrawl.id);
      expect(foundCrawl!.jobId).toBe(originalCrawl.jobId);
      expect(foundCrawl!.url).toBe(originalCrawl.url);
      expect(foundCrawl!.name).toBe(originalCrawl.name);
      expect(foundCrawl!.status).toBe(CrawlStatus.PENDING);
    });

    it('should return null for non-existent crawl', async () => {
      const foundCrawl = await repository.findById('non-existent-job', 'non-existent-crawl');

      expect(foundCrawl).toBeNull();
    });
  });
});
