import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Session } from '../models/session';

export class TokenManager {
    static generateAccessToken(userId: string, email: string) {
        return jwt.sign({ id: userId, email }, process.env.JWT_KEY!, {
            expiresIn: '15m',
        });
    }

    static generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }

    static async rotateToken(oldRefreshToken: string, ip: string, agent: string) {
        const session = await Session.findOne({ refreshToken: oldRefreshToken });

        if (!session || !session.isValid) {
            if (session) {
                await Session.updateMany({ userId: session.userId }, { isValid: false });
            }
            return null;
        }

        session.isValid = false;
        await session.save();

        const newRefreshToken = this.generateRefreshToken();
        const newSession = new Session({
            userId: session.userId,
            refreshToken: newRefreshToken,
            ipAddress: ip,
            userAgent: agent,
        });
        await newSession.save();

        return { userId: session.userId, newRefreshToken };
    }
}