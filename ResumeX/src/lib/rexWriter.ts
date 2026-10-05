// Rex Writer: polishes interview answers into ATS-ready resume content before it is saved

import { api } from './api';

export interface WriterInput {
  messages: { role: 'user' | 'assistant'; content: string }[];
  formData: any;
  jobDescription?: string;
}

export interface PreparedResume {
  formData: any;
  tips: string[];
}

const BUSY_TIP =
  'Rex Writer was busy, so your answers were used as typed. Open "Chat with Rex" and press Update to polish them.';

export const prepareResume = async (
  templateId: string,
  input: WriterInput,
  polish: boolean
): Promise<PreparedResume> => {
  if (!polish) {
    return { formData: input.formData, tips: [] };
  }
  try {
    const result = await api.polish({
      template_id: templateId,
      form_data: input.formData,
      messages: input.messages,
      job_description: input.jobDescription || '',
    });
    return { formData: result.form_data, tips: result.suggestions };
  } catch {
    // Never block saving on the writer; the raw answers still make a valid resume
    return { formData: input.formData, tips: [BUSY_TIP] };
  }
};

// Tips are handed to the editor through this tab's storage
const tipsKey = (resumeId: string) => `resumex:tips:${resumeId}`;

export const saveTips = (resumeId: string, tips: string[]) => {
  try {
    if (tips.length) sessionStorage.setItem(tipsKey(resumeId), JSON.stringify(tips));
  } catch {
    // Storage unavailable; tips are a nice-to-have
  }
};

export const loadTips = (resumeId: string): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(tipsKey(resumeId)) || '[]');
  } catch {
    return [];
  }
};

export const clearTips = (resumeId: string) => {
  try {
    sessionStorage.removeItem(tipsKey(resumeId));
  } catch {
    // Storage unavailable; nothing to clear
  }
};
