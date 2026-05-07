import mongoose from 'mongoose';
import { app } from './app';
import { startOrderCreatedListener } from './listeners/order-created-listener';

const start = async () => {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be defined');
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY must be defined');
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET must be defined');
    if (!process.env.SNS_ORDER_TOPIC_ARN) throw new Error('SNS_ORDER_TOPIC_ARN must be defined');
    if (!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB (Payments)');
        startOrderCreatedListener();
    } catch (err) {
        console.error('Database connection failed', err);
    }

    const port = process.env.PORT || 3002;
    app.listen(port, () => {
        console.log(`Payment Service live on port ${port}`);
    });
};

start();