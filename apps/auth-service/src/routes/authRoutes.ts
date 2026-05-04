import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@cloud-system/common';
import {
    googleLogin,
    refreshToken,
    logout,
    signup,
    login
} from '../controllers/authController';

const router = express.Router();

router.post(
    '/google',
    [
        body('idToken')
            .notEmpty()
            .withMessage('Google ID Token is required')
    ],
    validateRequest,
    googleLogin
);

router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/signup',
    [
        body('username')
            .notEmpty()
            .withMessage('Username is required'),
        body('email')
            .isEmail()
            .withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    validateRequest,
    signup
);
router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Valid email is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    validateRequest,
    login
);

export { router as authRouter };