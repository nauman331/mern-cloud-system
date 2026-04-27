import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@cloud-system/common';
import {
    googleLogin,
    refreshToken,
    logout
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

export { router as authRouter };