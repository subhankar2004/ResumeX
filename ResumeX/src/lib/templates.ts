// Template metadata as returned by GET /templates

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'objective'
  | 'about'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'activities'
  | 'volunteer'
  | 'interests';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  tags: string[];
  is_pro_only: boolean;
  ats_score: number; // estimated ATS-friendliness, 0-100
  sections: SectionKey[];
}

export const ATS_SCORE_NOTE =
  'Estimated from the layout: single column, standard section headings, real selectable text and no graphics carrying meaning. Your content matters too: Rex Writer handles keywords and wording.';

// Gallery filters, matched against template tags
export const TEMPLATE_CATEGORIES = [
  { key: 'all', label: 'All', tags: [] as string[] },
  { key: 'tech', label: 'Tech & Data', tags: ['tech', 'engineering', 'data'] },
  { key: 'business', label: 'Business & Leadership', tags: ['business', 'non-tech', 'leadership', 'experienced', 'professional'] },
  { key: 'students', label: 'Students', tags: ['fresher', 'student', 'graduate'] },
  { key: 'career', label: 'Career change', tags: ['career-change', 'transferable-skills'] },
  { key: 'creative', label: 'Modern & Creative', tags: ['creative', 'design', 'modern', 'any-field'] },
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  personal: 'Contact details',
  summary: 'Summary',
  objective: 'Objective',
  about: 'About me',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  certifications: 'Certifications',
  activities: 'Activities',
  volunteer: 'Volunteering',
  interests: 'Interests',
};

// Preview assets rendered by `npm run render-previews` in backend/ and stored in public/templates
export const previewImage = (template: ResumeTemplate) => `/templates/${template.slug}.png`;
export const previewPdf = (template: ResumeTemplate) => `/templates/${template.slug}.pdf`;

// Whether the interview has collected anything for a section
export const isSectionComplete = (section: SectionKey, formData: any): boolean => {
  if (!formData) return false;
  if (section === 'personal') return Boolean(formData.personal?.name && formData.personal?.email);
  const value = formData[section];
  return Array.isArray(value) ? value.length > 0 : Boolean(value && String(value).trim());
};
