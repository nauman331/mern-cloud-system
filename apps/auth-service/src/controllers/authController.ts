import { NotAuthorizedError, BadRequestError } from '@cloud-system/common';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user';
import { Session } from '../models/session';
import { TokenManager } from '../services/token-manager';
import { NotificationService } from '../services/notification-service';
import { PasswordManager } from '../services/password-manager';

const client = new OAuth2Client(String(process.env.GOOGLE_CLIENT_ID));

const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

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
        user = User.build({
            email: payload.email,
            username: payload.name || payload.email.split('@')[0],
            googleId: payload.sub,
        });
        await user.save();

        await NotificationService.sendNotification(
            String(process.env.SNS_AUTH_TOPIC_ARN),
            `New user registered via Google: ${user.email}`
        );
    }

    const accessToken = TokenManager.generateAccessToken(user.id, user.email);
    const refreshToken = TokenManager.generateRefreshToken();

    const session = new Session({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || 'unknown',
        isValid: true
    });
    await session.save();

    setRefreshTokenCookie(res, refreshToken);
    res.status(201).send({ user, accessToken });
};

export const signup = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email is already in use');
    }

    const hashedPassword = await PasswordManager.hashPassword(password);

    const user = User.build({ username, email, password: hashedPassword });
    await user.save();

    const accessToken = TokenManager.generateAccessToken(user.id, user.email);
    const refreshToken = TokenManager.generateRefreshToken();

    const session = new Session({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || 'unknown',
        isValid: true
    });
    await session.save();

    setRefreshTokenCookie(res, refreshToken);
    res.status(201).send({ user, accessToken });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        throw new NotAuthorizedError();
    }

    const passwordsMatch = await PasswordManager.compare(user.password, password);
    if (!passwordsMatch) {
        throw new NotAuthorizedError();
    }

    const accessToken = TokenManager.generateAccessToken(user.id, user.email);
    const refreshToken = TokenManager.generateRefreshToken();

    const session = new Session({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || 'unknown',
        isValid: true
    });
    await session.save();

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).send({ user, accessToken });
};

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
    if (!user) throw new NotAuthorizedError();

    const accessToken = TokenManager.generateAccessToken(user.id, user.email);

    setRefreshTokenCookie(res, result.newRefreshToken);
    res.send({ accessToken });
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
        await Session.findOneAndUpdate({ refreshToken }, { isValid: false });
        await TokenManager.blacklistToken(refreshToken, 604800);
    }

    res.clearCookie('refreshToken');
    res.status(200).send({});
};