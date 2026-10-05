import { Response, NextFunction } from 'express';
import { ResumeService } from '../services/resume.service';
import { CompileService } from '../services/compile.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { ValidationError } from '../utils/errors';
import { sanitizeInterview } from '../services/ai.service';

export const ResumeController = {
  // GET /api/resumes
  async getResumes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const resumes = await ResumeService.getUserResumes(req.user.id);
      sendSuccess(res, { resumes });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/resumes/:id
  async getResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const resume = await ResumeService.getResumeWithStatus(id, req.user.id);

      sendSuccess(res, { resume });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/resumes
  async createResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title, template_id, form_data, interview } = req.body;

      if (!title || !template_id || !form_data) {
        throw new ValidationError('Missing required fields: title, template_id, form_data');
      }

      const resume = await ResumeService.createResume(
        req.user.id,
        req.user.plan,
        title,
        template_id,
        form_data,
        sanitizeInterview(interview)
      );

      sendSuccess(res, { resume }, 201, 'Resume created successfully');
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/resumes/:id
  async updateResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { title, form_data, latex_source, interview } = req.body;

      if (interview !== undefined && !sanitizeInterview(interview)) {
        throw new ValidationError('interview must be { messages, form_data, done } with valid messages');
      }

      const resume = await ResumeService.updateResume(id, req.user.id, {
        title,
        form_data,
        latex_source,
        interview: interview === undefined ? undefined : sanitizeInterview(interview)!,
      });

      sendSuccess(res, { resume }, 200, 'Resume updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/resumes/:id/fork
  async forkResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const resume = await ResumeService.forkResume(id, req.user.id, req.user.plan);

      sendSuccess(res, { resume }, 201, 'Resume forked successfully');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/resumes/:id
  async deleteResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await ResumeService.deleteResume(id, req.user.id);

      sendSuccess(res, null, 200, 'Resume deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/resumes/:id/compile
  async compileResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { latex_source } = req.body;

      // Verify resume ownership
      const resume = await ResumeService.getResume(id, req.user.id);

      // Use provided latex_source or fallback to resume's stored latex_source
      const sourceToCompile = latex_source || resume.latex_source;

      if (!sourceToCompile) {
        throw new ValidationError('No LaTeX source provided');
      }

      // Compile the LaTeX
      const startTime = Date.now();
      let pdfBuffer: Buffer;
      let duration: number;

      try {
        const result = await CompileService.compileLatex(sourceToCompile);
        pdfBuffer = result.pdfBuffer;
        duration = result.duration;

        // Log successful compilation
        await CompileService.logCompileJob(id, 'success', duration);

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${resume.title}.pdf"`);
        res.setHeader('X-Compile-Duration', duration.toString());
        res.send(pdfBuffer);
      } catch (compileError: any) {
        duration = Date.now() - startTime;

        // Log failed compilation
        await CompileService.logCompileJob(id, 'error', duration, compileError.message);

        // Return compilation error
        res.status(400).json({
          success: false,
          error: 'LaTeX compilation failed',
          compiler_log: compileError.message,
          duration_ms: duration,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
