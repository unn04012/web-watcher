import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  BatchGetItemCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { DynamoDBConfig } from '../../config/dynamodb.config';
import { Crawl } from '../crawl/crawl';
import { LLMAnalysis } from '../analyzer/llm/llm-analysis';
import { ICrawlRepository } from './crawl.repository.interface';
import { CrawlStatus } from '../crawl/crawl.types';

export class CrawlRepositoryDynamoDB implements ICrawlRepository {
  private readonly _client: DynamoDBClient;
  private readonly _tableName: string;

  constructor(private readonly dynamoDBConfig: DynamoDBConfig) {
    this._client = new DynamoDBClient({
      region: this.dynamoDBConfig.region,
      endpoint: this.dynamoDBConfig.endpoint,
    });
    this._tableName = this.dynamoDBConfig.tableName;
  }

  // ========== CREATE OPERATIONS ==========

  async save(crawl: Crawl): Promise<Crawl> {
    const crawlItem = crawl.toDynamoItem();
    const transactItems = [];

    // 1. Crawl 아이템 저장
    transactItems.push({
      Put: {
        TableName: this._tableName,
        Item: marshall(crawlItem),
        // 중복 방지 조건
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
      },
    });

    // 2. Analysis 아이템 저장 (있는 경우)
    if (crawl.llmAnalysis) {
      const analysisItem = crawl.llmAnalysis.toDynamoDBItem();
      transactItems.push({
        Put: {
          TableName: this._tableName,
          Item: marshall(analysisItem),
        },
      });
    }

    try {
      await this._client.send(
        new TransactWriteItemsCommand({
          TransactItems: transactItems,
        })
      );
      return crawl;
    } catch (error) {
      if ((error as Error).name === 'ConditionalCheckFailedException') {
        throw new Error(`Crawl with id ${crawl.id} already exists`);
      }
      throw error;
    }
  }

  async update(crawl: Crawl): Promise<Crawl> {
    const crawlItem = crawl.toDynamoItem();
    const transactItems = [];

    // 1. Crawl 아이템 업데이트
    transactItems.push({
      Put: {
        TableName: this._tableName,
        Item: marshall(crawlItem),
      },
    });

    // 2. Analysis 아이템 업데이트 (있는 경우)
    if (crawl.llmAnalysis) {
      const analysisItem = crawl.llmAnalysis.toDynamoDBItem();
      transactItems.push({
        Put: {
          TableName: this._tableName,
          Item: marshall(analysisItem),
        },
      });
    }

    await this._client.send(
      new TransactWriteItemsCommand({
        TransactItems: transactItems,
      })
    );

    return crawl;
  }

  // ========== READ OPERATIONS ==========

  async findById(jobId: string, crawlId: string): Promise<Crawl | null> {
    const result = await this._client.send(
      new GetItemCommand({
        TableName: this._tableName,
        Key: marshall({
          PK: `JOB#${jobId}`,
          SK: `CRAWL#${crawlId}`,
        }),
      })
    );

    if (!result.Item) {
      return null;
    }

    const crawlData = unmarshall(result.Item);

    return Crawl.fromDynamoDBItem(crawlData);
  }

  async findByIdWithAnalysis(requestId: string, crawlId: string): Promise<Crawl | null> {
    // Batch로 Crawl과 Analysis 동시 조회
    const result = await this._client.send(
      new BatchGetItemCommand({
        RequestItems: {
          [this._tableName]: {
            Keys: [marshall({ PK: `REQUEST#${requestId}`, SK: `CRAWL#${crawlId}` }), marshall({ PK: `REQUEST#${requestId}`, SK: `ANALYSIS#${crawlId}` })],
          },
        },
      })
    );

    const items = result.Responses?.[this._tableName];
    if (!items || items.length === 0) {
      return null;
    }

    const crawlItem = items.find((item) => unmarshall(item).SK.startsWith('CRAWL#'));
    const analysisItem = items.find((item) => unmarshall(item).SK.startsWith('ANALYSIS#'));

    if (!crawlItem) {
      return null;
    }

    const crawlData = unmarshall(crawlItem);
    const analysisData = analysisItem ? LLMAnalysis.fromDynamoDBItem(unmarshall(analysisItem)) : undefined;
    console.log(analysisData);

    return Crawl.fromDynamoDBItem(crawlData, analysisData);
  }

  async findByRequestId(requestId: string): Promise<Crawl[]> {
    const result = await this._client.send(
      new QueryCommand({
        TableName: this._tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: marshall({
          ':pk': `REQUEST#${requestId}`,
          ':sk': 'CRAWL#',
        }),
      })
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => {
      const crawlData = unmarshall(item);

      return Crawl.fromDynamoDBItem(crawlData);
    });
  }

  async findByStatus(status: CrawlStatus, limit?: number): Promise<Crawl[]> {
    const result = await this._client.send(
      new QueryCommand({
        TableName: this._tableName,
        IndexName: 'GSI1', // GSI1PK-GSI1SK
        KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: marshall({
          ':status': `STATUS#${status}`,
        }),
        Limit: limit,
        ScanIndexForward: false, // 최신순 정렬
      })
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => {
      const crawlData = unmarshall(item);

      return Crawl.fromDynamoDBItem(crawlData);
    });
  }

  async findByAnalysisStatus(analysisStatus: string, limit?: number): Promise<Crawl[]> {
    const result = await this._client.send(
      new QueryCommand({
        TableName: this._tableName,
        IndexName: 'GSI3', // GSI3PK-GSI3SK
        KeyConditionExpression: 'GSI3PK = :status',
        ExpressionAttributeValues: marshall({
          ':status': `ANALYSIS_STATUS#${analysisStatus}`,
        }),
        Limit: limit,
        ScanIndexForward: false,
      })
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => {
      const crawlData = unmarshall(item);

      return Crawl.fromDynamoDBItem(crawlData);
    });
  }

  // ========== ANALYSIS SPECIFIC OPERATIONS ==========

  async findAnalysisById(requestId: string, crawlId: string): Promise<LLMAnalysis | null> {
    const result = await this._client.send(
      new GetItemCommand({
        TableName: this._tableName,
        Key: marshall({
          PK: `REQUEST#${requestId}`,
          SK: `ANALYSIS#${crawlId}`,
        }),
      })
    );

    if (!result.Item) {
      return null;
    }

    const analysisData = unmarshall(result.Item);
    return LLMAnalysis.fromDynamoDBItem(analysisData);
  }

  async findAnalysesByModel(model: string, limit?: number): Promise<LLMAnalysis[]> {
    const result = await this._client.send(
      new QueryCommand({
        TableName: this._tableName,
        IndexName: 'GSI2', // GSI2PK-GSI2SK
        KeyConditionExpression: 'GSI2PK = :model',
        ExpressionAttributeValues: marshall({
          ':model': `MODEL#${model}`,
        }),
        Limit: limit,
        ScanIndexForward: false,
      })
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => {
      const analysisData = unmarshall(item);
      return LLMAnalysis.fromDynamoDBItem(analysisData);
    });
  }

  async getTokenUsageByDateRange(startDate: Date, endDate: Date): Promise<TokenUsageStats> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // 날짜 범위별로 여러번 쿼리 (DynamoDB 한계)
    const results = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      const result = await this._client.send(
        new QueryCommand({
          TableName: this._tableName,
          IndexName: 'GSI3',
          KeyConditionExpression: 'GSI3PK = :date',
          ExpressionAttributeValues: marshall({
            ':date': `DATE#${dateStr}`,
          }),
          ProjectionExpression: 'inputTokens, outputTokens, totalTokens, analysisModel',
        })
      );

      if (result.Items) {
        results.push(...result.Items.map((item) => unmarshall(item)));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return this.calculateTokenStats(results);
  }

  // ========== DELETE OPERATIONS ==========

  async delete(requestId: string, crawlId: string): Promise<void> {
    const transactItems = [];

    // 1. Crawl 아이템 삭제
    transactItems.push({
      Delete: {
        TableName: this._tableName,
        Key: marshall({
          PK: `REQUEST#${requestId}`,
          SK: `CRAWL#${crawlId}`,
        }),
      },
    });

    // 2. Analysis 아이템 삭제 (있을 수 있음)
    transactItems.push({
      Delete: {
        TableName: this._tableName,
        Key: marshall({
          PK: `REQUEST#${requestId}`,
          SK: `ANALYSIS#${crawlId}`,
        }),
      },
    });

    await this._client.send(
      new TransactWriteItemsCommand({
        TransactItems: transactItems,
      })
    );
  }

  // ========== UTILITY METHODS ==========

  private calculateTokenStats(items: any[]): TokenUsageStats {
    const stats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      analysisCount: items.length,
      modelBreakdown: {} as Record<string, number>,
    };

    items.forEach((item) => {
      stats.totalInputTokens += item.inputTokens || 0;
      stats.totalOutputTokens += item.outputTokens || 0;
      stats.totalTokens += item.totalTokens || 0;

      const model = item.analysisModel || 'unknown';
      stats.modelBreakdown[model] = (stats.modelBreakdown[model] || 0) + 1;
    });

    return stats;
  }

  // ========== LEGACY SUPPORT (기존 인터페이스 호환) ==========

  async findOneByUserIdWithUrl(userId: string, url: string): Promise<Crawl | null> {
    // 기존 메서드 호환성을 위해 GSI로 조회
    const result = await this._client.send(
      new QueryCommand({
        TableName: this._tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :userId',
        FilterExpression: '#url = :url',
        ExpressionAttributeNames: {
          '#url': 'url',
        },
        ExpressionAttributeValues: marshall({
          ':userId': `USER#${userId}`,
          ':url': url,
        }),
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const crawlData = unmarshall(result.Items[0]);

    return Crawl.fromDynamoDBItem(crawlData);
  }
}

// ========== TYPES ==========

interface TokenUsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  analysisCount: number;
  modelBreakdown: Record<string, number>;
}
