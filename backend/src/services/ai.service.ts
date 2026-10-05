import axios from 'axios';
import { config } from '../config';
import { AppError } from '../utils/errors';
import { ChatMessage, InterviewSession, ResumeFormData, ResumeSectionKey, TemplateDetails } from '../types';

export type { ChatMessage };

export const MAX_MESSAGES = 120;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export const isValidMessages = (messages: unknown): messages is ChatMessage[] =>
  Array.isArray(messages) &&
  messages.length <= MAX_MESSAGES &&
  messages.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length <= MAX_MESSAGE_LENGTH
  );

// Validate a stored interview sent by the client; null when absent or malformed
export const sanitizeInterview = (raw: any): InterviewSession | null => {
  if (!raw || typeof raw !== 'object' || !isValidMessages(raw.messages)) return null;
  return {
    messages: raw.messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
    form_data: normalizeFormData(raw.form_data),
    done: Boolean(raw.done),
    job_description: typeof raw.job_description === 'string' ? raw.job_description.slice(0, MAX_JOB_DESCRIPTION_LENGTH) : '',
  };
};

export interface InterviewTurn {
  reply: string;
  form_data: ResumeFormData;
  done: boolean;
}

const RETRY_DELAYS_MS = [1000, 2500];

// What the interviewer should collect for each section
const SECTION_GUIDE: Record<ResumeSectionKey, string> = {
  personal: 'full name, email, phone, city and country, plus optional LinkedIn, GitHub and portfolio URLs',
  summary: 'do not ask for it; Rex Writer drafts the summary from everything else (leave it empty)',
  objective: 'ask briefly what they are aiming for next; Rex Writer turns it into an objective (store their words)',
  about: 'ask one fun question about what drives them; Rex Writer turns it into an about-me (store their words)',
  education: 'for each degree: degree name, institution, graduation year, optional GPA and location',
  experience:
    'for each role: job title, company, dates, location; then what they built or owned, the scale (users, revenue, team size, volume, budget), the results, and the tools they used',
  projects: 'for each project: what it does, who used it or what it achieved, tech stack, optional link',
  skills: 'the tools, technologies and skills they use most (Rex Writer organises them into categories)',
  certifications: 'for each certification: name, issuer, date',
  activities: 'clubs, leadership and events: name, role, duration, one-line description',
  volunteer: 'for each: organization, role, duration, one-line description',
  interests: 'a few personal interests, as a short comma-separated phrase',
};

const EMPTY_FORM_DATA: ResumeFormData = {
  personal: { name: '', email: '', phone: '' },
  education: [],
  experience: [],
  skills: [],
  projects: [],
};

// Gemini response schema (OpenAPI subset). Every field is required (empty string or array when
// unknown): with optional fields the model skips or misfiles details it was given.
export const str = (description: string) => ({ type: 'string', description });
export const strList = (description: string) => ({ type: 'array', items: { type: 'string' }, description });
const obj = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
});
const objList = (properties: Record<string, unknown>) => ({ type: 'array', items: obj(properties) });

export const SECTION_SCHEMAS: Record<ResumeSectionKey, unknown> = {
  personal: obj({
    name: str('Full name'),
    email: str('Email address'),
    phone: str('Phone number'),
    location: str('City and country, e.g. "Bangalore, India"'),
    linkedin: str('LinkedIn profile URL or path, e.g. linkedin.com/in/name'),
    github: str('GitHub profile URL or path, e.g. github.com/name'),
    website: str('Personal website or portfolio URL (not LinkedIn or GitHub)'),
  }),
  summary: str('2-3 sentence professional summary you write'),
  objective: str('One-sentence career objective you write'),
  about: str('Short about-me paragraph you write'),
  interests: str('Comma-separated personal interests'),
  education: objList({
    degree: str('Degree and field'), institution: str('School or university'),
    graduation_year: str('Graduation year or expected year'), gpa: str('GPA or CGPA if given'),
    location: str('City of the institution'),
  }),
  experience: objList({
    role: str('Job title'), company: str('Company'), duration: str('e.g. "Jul 2023 -- Present"'),
    location: str('City or Remote'), highlights: strList('2-4 achievement bullets starting with a verb'),
  }),
  projects: objList({
    name: str('Project name'), description: str('One-line description'),
    tech_stack: strList('Technologies used'), link: str('URL if given'),
  }),
  skills: objList({ category: str('e.g. Languages, Frameworks, Tools'), items: strList('Skills in this category') }),
  certifications: objList({ name: str('Certification name'), issuer: str('Issuer'), date: str('Year or date') }),
  activities: objList({
    name: str('Club, event or organization'), role: str('Their role'),
    duration: str('Dates'), description: str('One-line description'),
  }),
  volunteer: objList({
    organization: str('Organization'), role: str('Their role'),
    duration: str('Dates'), description: str('One-line description'),
  }),
};

// Only the sections this template uses, so the model has less to juggle
const buildResponseSchema = (sections: ResumeSectionKey[]) => {
  const formData: Record<string, unknown> = {};
  for (const section of sections) {
    formData[section] = SECTION_SCHEMAS[section];
  }
  return {
    type: 'object',
    properties: {
      reply: str('Your next chat message to the user'),
      done: { type: 'boolean', description: 'True once every section is covered or skipped' },
      form_data: {
        type: 'object',
        properties: { target_role: str('Job title they are aiming for, in their words'), ...formData },
        required: ['target_role', ...sections],
      },
    },
    required: ['reply', 'done', 'form_data'],
  };
};

const buildSystemPrompt = (
  template: TemplateDetails,
  user: { email: string; profile_type?: string },
  formData: ResumeFormData
): string => {
  const sections = template.sections
    .map((key, index) => `${index + 1}. ${key}: ${SECTION_GUIDE[key]}`)
    .join('\n');

  return `You are Rex, ResumeX's resume buddy. You are interviewing someone to build their resume with the "${template.name}" template (${template.description}).

STYLE
- Talk like a friendly peer over coffee: casual, upbeat, a little playful. At most one emoji per message.
- Keep each message to 1-3 short sentences. Ask ONE thing at a time; you may bundle tiny related facts (e.g. phone and city).
- Briefly react to their answer before asking the next question. Never lecture or list everything you need.

FIRST, if target_role is empty, ask what role they're going for (e.g. "Backend Engineer", "Marketing Manager", "Nurse"). Tune every later question to that field.

WHAT TO COLLECT, in this order (this template has no other sections, so do not ask about anything else):
${sections}

DIG FOR IMPACT (this is what makes a resume stand out to recruiters and ATS)
- For each role or project, once they say what they did, ask ONE follow-up for the strongest missing piece: the scale (how many users, customers, patients, deals, people), the result (%, money, time saved, rank), or the tools used. If they don't know, accept it and move on; never push twice.
- Use field-appropriate examples: engineers (latency, uptime, users), sales/marketing (revenue, pipeline, conversion), healthcare (patients, outcomes), operations (cost, time, volume), students (grades, rankings, users of a project).

DATA RULES
- Record facts exactly as given. Never invent employers, schools, dates, numbers, links or locations; leave a field as an empty string until they tell you.
- Never write placeholders or filler (e.g. "University/College", "<name> project"). If a key detail like a school name or what a project does is missing, ask for it once.
- Capture work and project details as short bullets that start with a verb and keep their numbers and tools. Don't polish heavily: Rex Writer rewrites everything for ATS when they press Build, so focus on getting the facts.
- If they don't have something (e.g. no work experience yet), leave that list empty and move on cheerfully.
- If they correct something said earlier, update it.
- Their account email is ${user.email}: confirm it instead of asking from scratch.${user.profile_type ? `\n- Their profile type is "${user.profile_type}"; tune questions to it.` : ''}

OUTPUT (JSON)
- reply: your next chat message.
- form_data: the COMPLETE resume data so far. Copy everything from the current data below, then add or change only what this turn adds.
- done: true only once every section above is covered or skipped; your reply then wraps up, says Rex Writer will polish the wording for ATS, and tells them to press the build/update button.

CURRENT DATA
${JSON.stringify(formData)}`;
};

// Coerce the model's form_data into the shape the template engine expects
const text = (value: unknown, maxLength = 600): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const list = (value: unknown, maxItems = 12): any[] =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === 'object').slice(0, maxItems) : [];
const textList = (value: unknown, maxItems = 20): string[] =>
  Array.isArray(value) ? value.map((item) => text(item, 300)).filter(Boolean).slice(0, maxItems) : [];

// Profile links copied from the browser often carry tracking params (e.g. ?isSelfProfile=true)
const profileUrl = (value: unknown): string => text(value, 300).replace(/[?#].*$/, '').replace(/\/$/, '');

export const normalizeFormData = (raw: any): ResumeFormData => {
  const data = raw && typeof raw === 'object' ? raw : {};
  const personal = data.personal && typeof data.personal === 'object' ? data.personal : {};

  return {
    personal: {
      name: text(personal.name, 120),
      email: text(personal.email, 200),
      phone: text(personal.phone, 50),
      location: text(personal.location, 120),
      linkedin: profileUrl(personal.linkedin),
      github: profileUrl(personal.github),
      website: text(personal.website, 300),
    },
    target_role: text(data.target_role, 120),
    summary: text(data.summary, 1200),
    objective: text(data.objective, 600),
    about: text(data.about, 1200),
    interests: text(data.interests, 300),
    education: list(data.education)
      .map((e) => ({
        degree: text(e.degree), institution: text(e.institution),
        graduation_year: text(e.graduation_year, 40), gpa: text(e.gpa, 20), location: text(e.location, 120),
      }))
      .filter((e) => e.degree || e.institution),
    experience: list(data.experience)
      .map((e) => ({
        role: text(e.role), company: text(e.company), duration: text(e.duration, 60),
        location: text(e.location, 120), highlights: textList(e.highlights, 8),
      }))
      .filter((e) => e.role || e.company),
    projects: list(data.projects)
      .map((p) => ({
        name: text(p.name), description: text(p.description), tech_stack: textList(p.tech_stack), link: text(p.link, 300),
      }))
      .filter((p) => p.name),
    skills: list(data.skills)
      .map((s) => ({ category: text(s.category, 80), items: textList(s.items, 30) }))
      .filter((s) => s.category && s.items.length),
    certifications: list(data.certifications)
      .map((c) => ({ name: text(c.name), issuer: text(c.issuer), date: text(c.date, 40) }))
      .filter((c) => c.name),
    activities: list(data.activities)
      .map((a) => ({ name: text(a.name), role: text(a.role), duration: text(a.duration, 60), description: text(a.description) }))
      .filter((a) => a.name),
    volunteer: list(data.volunteer)
      .map((v) => ({ organization: text(v.organization), role: text(v.role), duration: text(v.duration, 60), description: text(v.description) }))
      .filter((v) => v.organization),
  };
};

// The model sometimes drops earlier answers from form_data; keep anything it blanked out.
// (Removing a whole section is done in the editor rather than through the chat.)
const LIST_SECTIONS = ['education', 'experience', 'projects', 'skills', 'certifications', 'activities', 'volunteer'] as const;
const TEXT_SECTIONS = ['target_role', 'summary', 'objective', 'about', 'interests'] as const;

const mergeFormData = (previous: ResumeFormData, next: ResumeFormData): ResumeFormData => {
  const merged: ResumeFormData = { ...next, personal: { ...next.personal } };
  const personal = merged.personal as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(previous.personal)) {
    if (value && !personal[key]) personal[key] = value;
  }
  for (const key of TEXT_SECTIONS) {
    if (previous[key] && !merged[key]) merged[key] = previous[key];
  }
  for (const key of LIST_SECTIONS) {
    const previousItems = previous[key] as unknown[] | undefined;
    if (previousItems?.length && !(merged[key] as unknown[] | undefined)?.length) {
      (merged as any)[key] = previousItems;
    }
  }
  return merged;
};

// One structured-JSON Gemini call, retrying briefly when the model is overloaded or rate limited
export const callGemini = async (options: {
  model: string;
  thinkingLevel?: string;
  temperature: number;
  timeout: number;
  systemPrompt: string;
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  schema: unknown;
}): Promise<any> => {
  const request = () =>
    axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent`,
      {
        systemInstruction: { parts: [{ text: options.systemPrompt }] },
        contents: options.contents,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: options.schema,
          temperature: options.temperature,
          ...(options.thinkingLevel && { thinkingConfig: { thinkingLevel: options.thinkingLevel } }),
        },
      },
      {
        headers: { 'x-goog-api-key': config.ai.geminiApiKey },
        timeout: options.timeout,
        validateStatus: () => true,
      }
    );

  // Gemini returns 503 (overloaded) and 429 (rate limited) under load
  let response = await request();
  for (const delayMs of RETRY_DELAYS_MS) {
    if (response.status !== 503 && response.status !== 429) break;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    response = await request();
  }

  if (response.status !== 200) {
    console.error('Gemini error:', response.status, JSON.stringify(response.data).slice(0, 500));
    throw new AppError(
      response.status === 503 || response.status === 429
        ? 'Rex is a little busy right now. Give it a few seconds and try again'
        : 'Rex is unavailable right now, please try again',
      502
    );
  }

  try {
    return JSON.parse(response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
  } catch {
    throw new AppError('Rex gave an unexpected answer, please try again', 502);
  }
};

export const AIService = {
  isConfigured(): boolean {
    return Boolean(config.ai.geminiApiKey);
  },

  // One interview turn: the assistant's next message plus the updated resume data
  async interview(
    template: TemplateDetails,
    user: { email: string; profile_type?: string },
    messages: ChatMessage[],
    formData: ResumeFormData | undefined
  ): Promise<InterviewTurn> {
    if (!this.isConfigured()) {
      throw new AppError('The AI interviewer is not configured yet', 503);
    }

    const currentData = normalizeFormData(formData || EMPTY_FORM_DATA);
    // Start from the account email; Rex confirms it rather than asking
    if (!currentData.personal.email) {
      currentData.personal.email = user.email;
    }

    // Gemini needs at least one user turn; the first one just opens the conversation
    const hasExistingData = Boolean(
      currentData.personal.name || currentData.education.length || currentData.experience.length
    );
    const opener = hasExistingData
      ? '(The user is back to update a resume that already has the data above. Welcome them back briefly, say in one line what is there, and ask what they would like to add or change.)'
      : '(The user just opened the chat. Greet them and ask your first question.)';
    const contents = [
      { role: 'user', parts: [{ text: opener }] },
      ...messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
    ];

    const parsed = await callGemini({
      model: config.ai.geminiModel,
      thinkingLevel: config.ai.thinkingLevel,
      temperature: 0.8,
      timeout: config.ai.timeout,
      systemPrompt: buildSystemPrompt(template, user, currentData),
      contents,
      schema: buildResponseSchema(template.sections),
    });

    const reply = text(parsed.reply, 2000);
    if (!reply) {
      throw new AppError('Rex gave an unexpected answer, please try again', 502);
    }

    return {
      reply,
      form_data: mergeFormData(currentData, normalizeFormData(parsed.form_data)),
      done: Boolean(parsed.done),
    };
  },
};
