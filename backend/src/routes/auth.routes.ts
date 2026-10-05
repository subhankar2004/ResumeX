import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

// OAuth (browser redirects, not JSON endpoints)
router.get('/github', AuthController.oauthRedirect('github'));
router.get('/github/callback', AuthController.oauthCallback('github'));
router.get('/google', AuthController.oauthRedirect('google'));
router.get('/google/callback', AuthController.oauthCallback('google'));

// Protected routes
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
