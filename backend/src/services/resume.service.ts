import { ResumeModel } from '../models/resume.model';
import { TemplateService } from './template.service';
import { InterviewSession, Resume, ResumeFormData } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const FREE_RESUME_LIMIT = 2;

export const ResumeService = {
  // Free users can keep up to FREE_RESUME_LIMIT resumes
  async assertCanAddResume(userId: string, userPlan: string): Promise<void> {
    if (userPlan !== 'free') return;
    const count = await ResumeModel.countByUserId(userId);
    if (count >= FREE_RESUME_LIMIT) {
      throw new ForbiddenError(
        `Free plan allows up to ${FREE_RESUME_LIMIT} resumes. Delete one or upgrade to Pro for unlimited resumes.`
      );
    }
  },

  // Resume plus whether its LaTeX was edited by hand since it was generated from form_data,
  // so the UI can warn before regenerating
  async getResumeWithStatus(id: string, userId: string): Promise<Resume & { has_manual_edits: boolean }> {
    const resume = await this.getResume(id, userId);
    let hasManualEdits = true;
    if (resume.template_id) {
      try {
        const generated = await TemplateService.populateTemplate(resume.template_id, resume.form_data);
        hasManualEdits = generated !== resume.latex_source;
      } catch {
        // Template missing: treat the LaTeX as hand-maintained
      }
    }
    return { ...resume, has_manual_edits: hasManualEdits };
  },

  // Get all resumes for user
  async getUserResumes(userId: string): Promise<Resume[]> {
    return ResumeModel.findByUserId(userId);
  },

  // Get single resume
  async getResume(id: string, userId: string): Promise<Resume> {
    const resume = await ResumeModel.findById(id, userId);
    if (!resume) {
      throw new NotFoundError('Resume not found');
    }
    return resume;
  },

  // Create new resume
  async createResume(
    userId: string,
    userPlan: string,
    title: string,
    templateId: string,
    formData: ResumeFormData,
    interview: InterviewSession | null = null
  ): Promise<Resume> {
    await this.assertCanAddResume(userId, userPlan);

    // Validate template exists and is available on the user's plan
    const template = await TemplateService.getTemplate(templateId);
    if (template.is_pro_only && userPlan !== 'pro') {
      throw new ForbiddenError(`${template.name} is a Pro template. Upgrade to Pro to use it.`);
    }

    // Populate template with form data
    const latexSource = await TemplateService.populateTemplate(templateId, formData);

    // Create resume
    return ResumeModel.create(userId, title, templateId, formData, latexSource, interview);
  },

  // Update resume
  async updateResume(
    id: string,
    userId: string,
    updates: {
      title?: string;
      form_data?: ResumeFormData;
      latex_source?: string;
      interview?: InterviewSession;
    }
  ): Promise<Resume> {
    const resume = await this.getResume(id, userId);

    // If form_data is updated, regenerate latex_source
    if (updates.form_data && !updates.latex_source) {
      updates.latex_source = await TemplateService.populateTemplate(
        resume.template_id,
        updates.form_data
      );
    }

    const updated = await ResumeModel.update(id, userId, updates);
    if (!updated) {
      throw new NotFoundError('Resume not found or update failed');
    }

    return updated;
  },

  // Fork resume
  async forkResume(id: string, userId: string, userPlan: string): Promise<Resume> {
    const original = await this.getResume(id, userId);
    await this.assertCanAddResume(userId, userPlan);

    const newTitle = `${original.title} (Copy)`;
    const forked = await ResumeModel.fork(id, userId, newTitle);

    if (!forked) {
      throw new Error('Failed to fork resume');
    }

    return forked;
  },

  // Delete resume
  async deleteResume(id: string, userId: string): Promise<void> {
    const deleted = await ResumeModel.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Resume not found');
    }
  },
};
