import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Optional auth - shows different templates based on user plan
router.get('/', optionalAuth, TemplateController.getTemplates);
router.get('/:id', optionalAuth, TemplateController.getTemplate);

export default router;
