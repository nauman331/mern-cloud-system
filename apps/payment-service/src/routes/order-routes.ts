import express from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@cloud-system/common';
import { createOrder } from '../controllers/order-controller';

const router = express.Router();

router.post(
    '/orders',
    requireAuth,
    [
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
        body('description').not().isEmpty().withMessage('Description is required')
    ],
    validateRequest,
    createOrder
);

export { router as orderRouter };