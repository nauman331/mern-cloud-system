import { SQSClient } from '@aws-sdk/client-sqs';
import { Consumer } from 'sqs-consumer';
import { Order, OrderStatus } from '../models/order';

const sqsClient = new SQSClient({
    endpoint: process.env.SNS_ENDPOINT,
    region: process.env.AWS_REGION || 'us-east-1',
});


export const startOrderCreatedListener = () => {
    const app = Consumer.create({
        queueUrl: `http://localstack:4566/000000000000/payment-order-queue`,
        sqs: sqsClient,
        handleMessage: async (message) => {
            if (!message.Body) return undefined;

            try {
                const snsEnvelope = JSON.parse(message.Body);
                const event = JSON.parse(snsEnvelope.Message);

                if (event.type === 'OrderCreated') {
                    const { id, price, userId } = event.data;

                    console.log(`Received OrderCreated event for Order: ${id}`);

                    const order = Order.build({
                        id,
                        price,
                        userId,
                        status: OrderStatus.Created,
                    });

                    await order.save();
                    console.log(`Local Order Replica Saved!`);
                }
            } catch (error) {
                console.error('Error processing SQS message:', error);
                throw error;
            }
        },
    });

    app.on('error', (err) => console.error('SQS Consumer Error:', err));
    app.on('processing_error', (err) => console.error('SQS Processing Error:', err));

    app.start();
    console.log('SQS Listener started: Watching for new orders...');
};