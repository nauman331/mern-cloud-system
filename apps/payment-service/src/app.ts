import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { errorHandler, currentUser, NotFoundError } from '@cloud-system/common';
import { orderRouter } from './routes/order-routes';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieParser());
app.use(currentUser);

app.use(orderRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };