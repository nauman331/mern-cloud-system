import express from 'express';
import { googleLogin, refreshToken, logout } from '../controllers/authController';

const router = express.Router();

router.post('/google', googleLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export { router as authRouter };