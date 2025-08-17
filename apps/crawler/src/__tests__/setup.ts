// Jest setup file for integration tests
import * as dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

// Set default test environment variables
process.env.DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'test-web-watcher-table';
process.env.DYNAMODB_REGION = process.env.DYNAMODB_REGION || 'us-east-1';
process.env.DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';