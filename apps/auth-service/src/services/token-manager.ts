import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Session } from '../models/session';
import { createClient } from 'redis';

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

export class TokenManager {
    static generateAccessToken(userId: string, email: string) {
        return jwt.sign({ id: userId, email }, process.env.JWT_KEY!, {
            expiresIn: '15m',
        });
    }

    static generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }

    static async blacklistToken(token: string, expiryInSeconds: number) {
        await redisClient.setEx(`blacklist:${token}`, expiryInSeconds, 'true');
    }

    static async isBlacklisted(token: string) {
        const result = await redisClient.get(`blacklist:${token}`);
        return result === 'true';
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