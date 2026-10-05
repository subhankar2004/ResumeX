import { config } from '../config';
import { AppError } from '../utils/errors';
import { ChatMessage, ResumeFormData, ResumeSectionKey, TemplateDetails } from '../types';
import { AIService, SECTION_SCHEMAS, callGemini, normalizeFormData, str, strList } from './ai.service';

export interface PolishResult {
  form_data: ResumeFormData;
  suggestions: string[];
}

// Most recent part of the chat, so the writer sees details the interview didn't put in fields
const TRANSCRIPT_LIMIT = 12000;

const WRITER_SECTION_NOTES: Partial<Record<ResumeSectionKey, string>> = {
  summary: 'summary: 2-3 sentences. Their CURRENT or most recent title (never claim the target title as one they hold; if the target differs, say they are pursuing it) + 2-3 specialties + the single strongest result from the data. No first person, no clichés (results-driven, hard-working, team player, passionate).',
  objective: 'objective: one sentence naming the target role and the value they bring, built from what they said they want.',
  about: 'about: 2-3 warm, specific sentences in third-person-free resume voice, from what drives them.',
  experience: 'experience: 3-5 bullets for the most recent roles, 2-3 for older ones.',
  projects: 'projects: description is one line covering what it does + its result or users + how.',
  skills: 'skills: 2-4 categories suited to the field (tech: Languages / Frameworks / Cloud & Tools; business: Leadership / Domain / Tools). Most relevant to the target role first.',
  activities: 'activities: description is one short line of what they did or achieved.',
  volunteer: 'volunteer: description is one short line of what they did or achieved.',
};

const buildWriterPrompt = (template: TemplateDetails, targetRole: string, hasJobDescription: boolean) => `You are Rex Writer, an expert resume writer and ATS specialist. You have written resumes that got engineers hired at top tech companies and professionals hired in business, healthcare, finance, education and the trades. Rewrite the candidate's raw data into a polished, ATS-optimised resume.

TARGET ROLE: ${targetRole || 'infer it from their most recent experience'}
TEMPLATE: "${template.name}". Fill only these sections: ${template.sections.join(', ')}.

WRITING RULES
- Bullets follow "accomplished X, measured by Y, by doing Z": lead with a strong action verb (past tense; present tense for a current role), then the result, then how. One line, two at most (under ~28 words).
- Vary verbs; never start two bullets in a role with the same verb. No pronouns, no "responsible for", "worked on", "helped with", "various".
- Put the most impressive, most role-relevant bullet first in each role.
- Use the standard spelling of tools and terms (JavaScript, Node.js, PostgreSQL, Kubernetes, Salesforce, Microsoft Excel) and spell out an acronym once if recruiters search both forms.
- Weave in keywords a recruiter for the target role would search for, but only where the data shows the candidate actually has that skill.
${template.sections.map((s) => WRITER_SECTION_NOTES[s]).filter(Boolean).map((n) => `- ${n}`).join('\n')}

TRUTH RULES (strict; resumes with invented facts fail in interviews)
- Use only facts in RAW DATA or the CONVERSATION. Never invent employers, titles, dates, schools, degrees, certifications, tools, or ANY number (%, money, counts, team size, users, time).
- If a bullet has no number, show scope or outcome in words instead of making one up.
- Write every number as digits (12%, 300 users, 40 million), never spelled out.
- Never state years of experience, team sizes or seniority unless the candidate said them.
- Never add duties, responsibilities, tools or outcomes they didn't mention. When their input is thin, keep the line short and plain rather than embellishing; skip filler endings like "to ensure optimal outcomes".
- You may rephrase, reorder, merge duplicate points, split an overloaded point, add context clearly implied by stated facts, and use the standard name of a tool they mentioned.
- Keep the same number and order of experience, education, project, certification, activity and volunteer entries as RAW DATA. Copy names, titles, companies, dates and locations exactly.
${hasJobDescription ? '- A JOB DESCRIPTION is provided: mirror its exact keywords and phrasing where the candidate genuinely has that experience, and order skills to match it. Never claim requirements they lack.\n' : ''}
SUGGESTIONS
Also return 3-5 short, specific tips (max ~15 words each) telling the candidate which REAL details would make this resume stronger, e.g. "Add how many users the payments service handled". Do not repeat things already in the resume.`;

const buildWriterSchema = (sections: ResumeSectionKey[]) => {
  const formData: Record<string, unknown> = {};
  for (const section of sections) {
    formData[section] = SECTION_SCHEMAS[section];
  }
  return {
    type: 'object',
    properties: {
      form_data: { type: 'object', properties: formData, required: sections },
      suggestions: strList('3-5 short tips naming real details that would strengthen the resume'),
      target_role_used: str('The target role you wrote for'),
    },
    required: ['form_data', 'suggestions', 'target_role_used'],
  };
};

// --- Guardrails: the writer may change wording, never facts ---------------------------------

const numbersIn = (value: string): string[] =>
  (value.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(/,/g, ''));

// Spelled-out magnitudes ("forty million") are checked too: the scale word must come from the candidate
const MAGNITUDES = ['hundred', 'thousand', 'million', 'billion', 'lakh', 'crore', 'dozen'];

// Spelled-out quantities ("one year", "three hundred users") would slip past the digit check
const SPELLED_QUANTITY =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(years?|months?|percent|users|customers|clients|people|members|engineers|employees|patients|students|hundred|thousand|million|billion)\b/i;

// Every number in the polished text must already appear in what the candidate told us
const makeNumberCheck = (sourceText: string) => {
  const known = new Set(numbersIn(sourceText));
  const source = sourceText.toLowerCase();
  return (value: string) => {
    const unknownNumbers = numbersIn(value).filter((n) => !known.has(n));
    const lower = value.toLowerCase();
    const unknownWords = MAGNITUDES.filter((w) => lower.includes(w) && !source.includes(w));
    const spelled = value.match(SPELLED_QUANTITY);
    if (spelled && !source.includes(spelled[0].toLowerCase())) unknownWords.push(spelled[0]);
    // "N years" claims must be stated as such, not just share a digit with something else
    for (const claim of value.match(/\d+\+?\s*(?:years?|yrs?)\b/gi) || []) {
      const years = claim.match(/\d+/)![0];
      if (!new RegExp(`\\b${years}\\+?\\s*(?:years?|yrs?)\\b`, 'i').test(sourceText)) unknownWords.push(claim);
    }
    if (unknownNumbers.length || unknownWords.length) {
      console.warn('Rex Writer: rejected unsupported figures', [...unknownNumbers, ...unknownWords], '|', value.slice(0, 120));
      return false;
    }
    return true;
  };
};

const STOPWORDS = new Set(['and', 'the', 'of', 'for', 'with', 'in', 'to', 'a', 'an', 'on', 'js']);
const tokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

// A skill is kept only if one of its words matches what the candidate said, allowing standard full
// names of what they typed ("Apache Kafka" <- "kafka", "PostgreSQL" <- "postgres")
const makeSkillCheck = (sourceText: string) => {
  const known = [...new Set(tokens(sourceText))];
  const matches = (t: string) =>
    known.some((k) => k === t || (k.length >= 4 && t.startsWith(k)) || (t.length >= 4 && k.startsWith(t)));
  return (skill: string) => {
    const ok = tokens(skill).some(matches);
    if (!ok) console.warn('Rex Writer: dropped unsupported skill', skill);
    return ok;
  };
};

export const lockFacts = (
  original: ResumeFormData,
  polished: ResumeFormData,
  sourceText: string
): ResumeFormData => {
  const numbersOk = makeNumberCheck(sourceText);
  const skillOk = makeSkillCheck(sourceText);
  const textOk = (value?: string) => Boolean(value && numbersOk(value));

  const experience = original.experience.map((entry, i) => {
    const highlights = (polished.experience[i]?.highlights || []).filter(Boolean).slice(0, 5);
    // One unsupported number rejects the role's rewrite rather than shipping a made-up metric
    const rewriteOk = highlights.length > 0 && highlights.every(numbersOk);
    return { ...entry, highlights: rewriteOk ? highlights : entry.highlights };
  });

  const projects = original.projects.map((entry, i) => {
    const candidate = polished.projects[i];
    const techStack = (candidate?.tech_stack || []).filter(skillOk);
    return {
      ...entry,
      description: textOk(candidate?.description) ? candidate!.description : entry.description,
      tech_stack: techStack.length ? techStack : entry.tech_stack,
    };
  });

  const skills = polished.skills
    .map((group) => ({ category: group.category, items: group.items.filter(skillOk) }))
    .filter((group) => group.category && group.items.length);

  const describe = <T extends { description?: string }>(originals: T[] = [], rewrites: T[] = []) =>
    originals.map((entry, i) => ({
      ...entry,
      description: textOk(rewrites[i]?.description) ? rewrites[i].description : entry.description,
    }));

  return {
    // Facts come from the original, untouched
    personal: original.personal,
    target_role: original.target_role,
    education: original.education,
    certifications: original.certifications,
    interests: original.interests,
    // Wording comes from the writer when it passes the checks
    summary: textOk(polished.summary) ? polished.summary : original.summary,
    objective: textOk(polished.objective) ? polished.objective : original.objective,
    about: textOk(polished.about) ? polished.about : original.about,
    experience,
    projects,
    skills: skills.length ? skills : original.skills,
    activities: describe(original.activities, polished.activities),
    volunteer: describe(original.volunteer, polished.volunteer),
  };
};

export const ResumeWriterService = {
  // Rewrite raw interview data into ATS-optimised resume content
  async polish(
    template: TemplateDetails,
    rawFormData: ResumeFormData,
    messages: ChatMessage[] = [],
    jobDescription = ''
  ): Promise<PolishResult> {
    if (!AIService.isConfigured()) {
      throw new AppError('Rex is not configured yet', 503);
    }

    const original = normalizeFormData(rawFormData);
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'Candidate' : 'Rex'}: ${m.content}`)
      .join('\n')
      .slice(-TRANSCRIPT_LIMIT);
    const jd = jobDescription.trim();

    const parsed = await callGemini({
      model: config.ai.writerModel,
      thinkingLevel: config.ai.writerThinkingLevel,
      temperature: 0.4,
      timeout: config.ai.writerTimeout,
      systemPrompt: buildWriterPrompt(template, original.target_role || '', Boolean(jd)),
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `RAW DATA\n${JSON.stringify(original)}\n\nCONVERSATION\n${transcript || '(none)'}${
                jd ? `\n\nJOB DESCRIPTION\n${jd}` : ''
              }`,
            },
          ],
        },
      ],
      schema: buildWriterSchema(template.sections),
    });

    // Numbers and skills may only come from the candidate, never from the job description
    const sourceText = `${JSON.stringify(original)}\n${transcript}`;
    const polished = normalizeFormData(parsed.form_data);

    return {
      form_data: lockFacts(original, polished, sourceText),
      suggestions: (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
        .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
        .map((s: string) => s.trim().slice(0, 200))
        .slice(0, 5),
    };
  },
};
