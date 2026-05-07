#!/bin/bash
echo "🚧 Initializing LocalStack AWS infrastructure..."

# 1. Create the SNS Topic (The Megaphone for the Order Service)
awslocal sns create-topic --name order-events

# 2. Create the SQS Queue (The Inbox for the Payment Service)
awslocal sqs create-queue --queue-name payment-order-queue

# 3. Subscribe the Queue to the Topic (Wire them together)
awslocal sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:000000000000:order-events \
    --protocol sqs \
    --notification-endpoint arn:aws:sqs:us-east-1:000000000000:payment-order-queue

echo "✅ LocalStack initialization complete!"