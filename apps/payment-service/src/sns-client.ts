import {
    SNSClient,
    PublishCommand,
} from '@aws-sdk/client-sns';

export const snsClient = new SNSClient({
    endpoint: process.env.SNS_ENDPOINT,
    region: process.env.AWS_REGION || 'us-east-1',
});

export const publishOrderCreated = async (orderId: string, price: number, userId: string) => {
    const params = {
        TopicArn: process.env.SNS_ORDER_TOPIC_ARN!,
        Message: JSON.stringify({
            type: 'OrderCreated',
            data: {
                id: orderId,
                price,
                userId,
                version: 0
            }
        }),
    }
    try {
        await snsClient.send(new PublishCommand(params));
        console.log(`Event Published: OrderCreated [${orderId}]`);
    } catch (err) {
        console.error('Failed to publish OrderCreated event:', err);
        // In production system, if this fails, we would use the "Outbox Pattern" 
        // to save the event in the database and retry it later.
    }
}