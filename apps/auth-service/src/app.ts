import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { errorHandler, currentUser } from '@cloud-system/common';

// Import Routes
import { authRouter } from './routes/auth-routes';

const app = express();

// 1. Proxy settings for AWS (Load Balancer support)
app.set('trust proxy', true);

// 2. Standard Middlewares
app.use(json());
app.use(cookieParser());

// 3. Identify User (from @cloud-system/common)
app.use(currentUser);

// 4. Routes
app.use('/api/auth', authRouter);

// 5. Catch-all for 404s (Standard Practice)
app.all('*', async () => {
    throw new Error('Route not found');
});

// 6. The Error Handler (MUST BE LAST)
// This is where 'errorHandler' is read and used.
app.use(errorHandler);

export { app };