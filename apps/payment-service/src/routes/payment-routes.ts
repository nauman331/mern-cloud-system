import express from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@cloud-system/common';
import { createPaymentIntent } from '../controllers/payment-controller';
import { stripeWebhook } from '../controllers/webhook-controller';

const router = express.Router();

router.post(
    '/create-intent',
    requireAuth,
    [
        body('orderId')
            .not()
            .isEmpty()
            .withMessage('orderId is required')
    ],
    validateRequest,
    createPaymentIntent
);

router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

export { router as paymentRouter };