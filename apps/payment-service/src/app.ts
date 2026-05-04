import express, { Request, Response, NextFunction, Application } from 'express';
import "express-async-errors";
import { json } from 'body-parser';
import { errorHandler, currentUser } from '@cloud-system/common';

const app: Application = express();

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === '/api/payments/webhook') {
        next();
    } else {
        json()(req, res, next);
    }
});

app.use(currentUser);

app.all('*', async () => {
    throw new Error('Route not found');
});

app.use(errorHandler);

export { app };