import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All AI routes require authentication
router.use(authenticateToken);

router.get('/status', AIController.status);
router.post('/interview', AIController.interview);
router.post('/polish', AIController.polish);

export default router;
