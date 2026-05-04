import mongoose from "mongoose";

export enum OrderStatus {
    Created = "created",
    Cancelled = "cancelled",
    AwaitingPayment = "awaiting:payment",
    Complete = "complete",
}

interface OrderAttrs {
    id: string;
    status: OrderStatus;
    userId: string;
    price: number;
}

interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        price: { type: Number, required: true },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created,
        },
        description: { type: String },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

orderSchema.set('versionKey', 'version');

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        userId: attrs.userId,
        price: attrs.price,
        status: attrs.status,
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };