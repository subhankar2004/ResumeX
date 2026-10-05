import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All resume routes require authentication
router.use(authenticateToken);

// Resume CRUD
router.get('/', ResumeController.getResumes);
router.post('/', ResumeController.createResume);
router.get('/:id', ResumeController.getResume);
router.patch('/:id', ResumeController.updateResume);
router.delete('/:id', ResumeController.deleteResume);

// Fork resume
router.post('/:id/fork', ResumeController.forkResume);

// Compile resume to PDF
router.post('/:id/compile', ResumeController.compileResume);

export default router;
