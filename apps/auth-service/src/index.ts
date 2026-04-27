import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    const requiredEnv = ['JWT_KEY', 'MONGO_URI', 'GOOGLE_CLIENT_ID', 'REDIS_HOST', 'REDIS_PORT', 'GOOGLE_CLIENT_SECRET'];
    for (const env of requiredEnv) {
        if (!process.env[env]) throw new Error(`${env} must be defined`);
    }

    try {
        await mongoose.connect(String(process.env.MONGO_URI));
        console.log('Connected to MongoDB');

        const server = app.listen(3001, () => {
            console.log('Auth Service v1.0.0 listening on port 3001');
        });

        // Graceful Shutdown Logic (For AWS/Docker)
        const shutdown = async () => {
            console.log('Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close().then(() => {
                    console.log('Connections closed. Exit.');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (err) {
        console.error('Initialization Error:', err);
    }
};

start();