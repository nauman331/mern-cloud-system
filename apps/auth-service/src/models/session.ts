import mongoose from 'mongoose';

interface SessionDoc extends mongoose.Document {
    userId: string;
    refreshToken: string;
    userAgent: string;
    ipAddress: string;
    isValid: boolean;
    createdAt: Date;
}

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    isValid: { type: Boolean, default: true }
}, { timestamps: true });

const Session = mongoose.model<SessionDoc>('Session', sessionSchema);
export { Session };