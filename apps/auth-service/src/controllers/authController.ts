import { NotAuthorizedError } from '@cloud-system/common'
import { Request, Response } from 'express';
import { TokenManager } from '../services/token-manager';
import { NotificationService } from '../services/notification-service';
import { User } from '../models/user';
import { Session } from '../models/session';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(String(process.env.GOOGLE_CLIENT_ID));

export const googleLogin = async (req: Request, res: Response) => {
    const { tokenId } = req.body;

    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) throw new NotAuthorizedError();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
        user = new User({
            email: payload.email,
            name: payload.name,
            googleId: payload.sub,
        });
        await user.save();
        await NotificationService.sendNotification(
            String(process.env.SNS_AUTH_TOPIC_ARN),
            `New user registered: ${user.email}`
        );
    }
    const accessToken = TokenManager.generateAccessToken(user.id, user.email);
    const refreshToken = TokenManager.generateRefreshToken();

    const session = new Session({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || 'unknown',
    });
    await session.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).send({ user, accessToken });

}

export const refreshToken = async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
        return res.status(401).send({ message: 'No refresh token provided' });
    }

    const result = await TokenManager.rotateToken(
        oldRefreshToken,
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
    );

    if (!result) {
        res.clearCookie('refreshToken');
        throw new NotAuthorizedError();
    }
    const user = await User.findById(result.userId);
    const accessToken = TokenManager.generateAccessToken(user!.id, user!.email);

    res.cookie('refreshToken', result.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send({ accessToken });

}


export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    await Session.findOneAndUpdate({ refreshToken }, { isValid: false });
    await TokenManager.blacklistToken(refreshToken, 604800);

    res.clearCookie('refreshToken');
    res.status(200).send({});
};