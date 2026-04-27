import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { errorHandler, currentUser } from '@cloud-system/common';
import { authRouter } from './routes/authRoutes';

const app = express();

app.set('trust proxy', true);

app.use(json());
app.use(cookieParser());
app.use(currentUser);
app.use('/api/auth', authRouter);
app.all('*', async () => {
    throw new Error('Route not found');
});


app.use(errorHandler);

export { app };