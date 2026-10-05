import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    profile_type?: string;
    plan: string;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  password_hash: string | null; // null for social-sign-in-only accounts
  profile_type?: 'fresher' | 'experienced' | 'tech' | 'non_tech';
  plan: 'free' | 'pro';
  created_at: Date;
  updated_at: Date;
}

// Signed-in user as returned by /auth/me, with how they can sign in
export type UserProfile = Omit<User, 'password_hash'> & {
  has_password: boolean;
  providers: OAuthProvider[];
};

// OAuth types
export type OAuthProvider = 'google' | 'github';

export interface OAuthProfile {
  providerUserId: string;
  email: string; // verified by the provider
}

// Resume types
export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  form_data: ResumeFormData;
  latex_source: string;
  forked_from?: string;
  interview?: InterviewSession | null;
  created_at: Date;
  updated_at: Date;
}

export interface ResumeFormData {
  personal: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    website?: string;
    location?: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    graduation_year: string;
    gpa?: string;
    location?: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    location?: string;
    highlights: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech_stack: string[];
    link?: string;
  }>;
  // Role the resume targets; steers wording and keywords, not printed
  target_role?: string;
  // Optional sections, used only by templates that have a placeholder for them
  summary?: string;
  objective?: string;
  about?: string;
  interests?: string;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    credential_id?: string;
  }>;
  activities?: Array<{
    name: string;
    role?: string;
    duration?: string;
    description?: string;
  }>;
  volunteer?: Array<{
    organization: string;
    role?: string;
    duration?: string;
    description?: string;
  }>;
}

// Rex conversation stored with a resume so it can be resumed
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InterviewSession {
  messages: ChatMessage[];
  form_data: ResumeFormData; // raw answers collected in the chat; Rex Writer polishes them on build
  done: boolean;
  job_description?: string; // optional posting the resume is tailored to
}

// A resume section a template can contain, detected from its {{PLACEHOLDERS}}
export type ResumeSectionKey =
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

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  tex_path: string;
  tags: string[];
  is_pro_only: boolean;
  ats_score: number; // estimated ATS-friendliness, 0-100
  created_at: Date;
}

// Template as returned by the API: adds the file slug (for preview images) and its sections
export interface TemplateDetails extends Template {
  slug: string;
  sections: ResumeSectionKey[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
