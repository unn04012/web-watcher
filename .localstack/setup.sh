#!/bin/bash
echo "🚀 Initializing LocalStack services..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack SQS service to be running..."
until curl -s http://localstack:4566/_localstack/health | grep -q '"sqs": "available"'
do
  echo "⏳ Waiting for LocalStack to be ready..."
  sleep 5
done

echo "✅ LocalStack is ready. Creating AWS resources..."

# Create SQS Queues
echo "📨 Creating SQS queues..."

# 1. Crawling Job Queue - 크롤링 작업을 처리하는 큐
aws --endpoint-url=http://localstack:4566 sqs create-queue \
    --queue-name crawling-jobs \
    --attributes VisibilityTimeout=300,MessageRetentionPeriod=1209600,ReceiveMessageWaitTimeSeconds=20

# 2. Analysis Job Queue - LLM 분석 작업을 처리하는 큐  
aws --endpoint-url=http://localstack:4566 sqs create-queue \
    --queue-name analysis-jobs \
    --attributes VisibilityTimeout=600,MessageRetentionPeriod=1209600,ReceiveMessageWaitTimeSeconds=20

# 3. Dead Letter Queue - 실패한 작업들을 처리하는 큐
aws --endpoint-url=http://localstack:4566 sqs create-queue \
    --queue-name dead-letter-queue \
    --attributes MessageRetentionPeriod=1209600


echo "✅ SQS queues created successfully!"

# List all created resources
echo "📋 Listing created resources..."

echo "SQS Queues:"
aws --endpoint-url=http://localstack:4566 sqs list-queues


echo "🎉 LocalStack initialization completed!"
