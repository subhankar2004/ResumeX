import { Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const TemplateController = {
  // GET /api/templates
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userPlan = req.user?.plan || 'free';
      // ?all=true lists Pro templates too, for the public gallery (creating with them is still gated)
      const includeAll = req.query.all === 'true';
      const templates = await TemplateService.getTemplates(userPlan, includeAll);

      sendSuccess(res, { templates });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/templates/:id
  async getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const template = await TemplateService.getTemplate(id);

      sendSuccess(res, { template });
    } catch (error) {
      next(error);
    }
  },
};
