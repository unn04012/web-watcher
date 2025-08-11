import { IConfigReader } from './config.reader';

export class DynamoDBConfig {
  constructor(private readonly _configReader: IConfigReader) {}

  get tableName(): string {
    return this._configReader.getOrError('DYNAMODB_TABLE_NAME');
  }

  get region(): string {
    const region = this._configReader.getOrDefault('DYNAMODB_REGION', 'us-east-1');
    return region;
  }

  get endpoint(): string {
    return this._configReader.getOrError('DYNAMODB_ENDPOINT');
  }
}
