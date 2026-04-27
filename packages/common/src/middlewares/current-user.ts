import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
    roles: string[];
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || req.cookies?.accessToken;
    if (!token) return next();

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        req.currentUser = payload;
        next();
    } catch (error) {
        console.error('Error verifying JWT:', error);
    }
    next();
}