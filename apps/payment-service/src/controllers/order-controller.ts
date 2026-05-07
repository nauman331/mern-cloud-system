import { Request, Response } from "express";
import { Order, OrderStatus } from "../models/order";
import { publishOrderCreated } from "../sns-client";

export const createOrder = async (req: Request, res: Response) => {
    const { price, description } = req.body;

    const order = Order.build({
        userId: req.currentUser!.id,
        price,
        description,
        status: OrderStatus.Created,
    });
    await order.save();

    await publishOrderCreated(order.id, order.price, order.userId);

    res.status(201).send(order);
}