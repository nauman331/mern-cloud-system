import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/order';
import { stripe } from '../stripe';
import {
    BadRequestError,
    NotAuthorizedError,
} from '@cloud-system/common';

export const createPaymentIntent = async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotAuthorizedError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order');
    }
    if (order.status === OrderStatus.Complete) {
        throw new BadRequestError('Order is already completed');
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: order.price * 100,
        currency: 'usd',
        metadata: {
            orderId: order.id,
        },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
}; 