import { Response, NextFunction } from 'express';
import {
  AIService,
  MAX_JOB_DESCRIPTION_LENGTH,
  MAX_MESSAGES,
  MAX_MESSAGE_LENGTH,
  isValidMessages,
} from '../services/ai.service';
import { ResumeWriterService } from '../services/resume-writer.service';
import { TemplateService } from '../services/template.service';
import { UserModel } from '../models/user.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../utils/errors';

export const AIController = {
  // GET /api/ai/status — whether the interviewer can be used
  status(_req: AuthenticatedRequest, res: Response): void {
    sendSuccess(res, { available: AIService.isConfigured() });
  },

  // POST /api/ai/interview — next interviewer message + updated resume data
  async interview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { template_id, messages = [], form_data } = req.body;

      if (typeof template_id !== 'string') {
        throw new ValidationError('template_id is required');
      }
      if (!isValidMessages(messages)) {
        throw new ValidationError(
          `messages must be at most ${MAX_MESSAGES} items of { role, content } with content under ${MAX_MESSAGE_LENGTH} characters`
        );
      }

      const template = await TemplateService.getTemplate(template_id);
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      if (template.is_pro_only && user.plan !== 'pro') {
        throw new ForbiddenError(`${template.name} is a Pro template. Upgrade to Pro to use it.`);
      }

      const turn = await AIService.interview(template, user, messages, form_data);
      sendSuccess(res, turn);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/ai/polish — Rex Writer rewrites collected data into ATS-optimised resume content
  async polish(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { template_id, form_data, messages = [], job_description = '' } = req.body;

      if (typeof template_id !== 'string' || !form_data || typeof form_data !== 'object') {
        throw new ValidationError('template_id and form_data are required');
      }
      if (!isValidMessages(messages)) {
        throw new ValidationError(`messages must be at most ${MAX_MESSAGES} valid chat messages`);
      }
      if (typeof job_description !== 'string' || job_description.length > MAX_JOB_DESCRIPTION_LENGTH) {
        throw new ValidationError(`job_description must be text under ${MAX_JOB_DESCRIPTION_LENGTH} characters`);
      }

      const template = await TemplateService.getTemplate(template_id);
      const user = await UserModel.findById(req.user.id);
      if (template.is_pro_only && user?.plan !== 'pro') {
        throw new ForbiddenError(`${template.name} is a Pro template. Upgrade to Pro to use it.`);
      }

      const result = await ResumeWriterService.polish(template, form_data, messages, job_description);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
