import { Request, Response } from 'express';
import { stripe } from '../stripe';
import { Order, OrderStatus } from '../models/order';
import { Payment } from '../models/payment';
import { BadRequestError } from '@cloud-system/common';

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    } catch (error) {
        throw new BadRequestError('Invalid Stripe webhook signature');
    }
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const orderId = event.data.object.metadata.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            console.error(`Order with ID ${orderId} not found`);
            return res.status(200).send();
        }
        order.status = OrderStatus.Complete;
        await order.save();

        const payment = Payment.build({
            orderId: order.id,
            stripeId: paymentIntent.id,
        });
        await payment.save();

        console.log(`Payment verified and saved for Order: ${orderId}`);
    }
    res.status(200).send();
}