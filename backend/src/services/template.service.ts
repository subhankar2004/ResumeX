import { readFileSync } from 'fs';
import { join } from 'path';
import { TemplateModel } from '../models/template.model';
import { Template, TemplateDetails, ResumeFormData, ResumeSectionKey } from '../types';
import { NotFoundError } from '../utils/errors';

// Which placeholders put a section in a template, in the order sections are asked about
const SECTION_PLACEHOLDERS: Array<[ResumeSectionKey, string[]]> = [
  ['personal', ['NAME', 'EMAIL', 'PHONE', 'LOCATION', 'CONTACT', 'LINKEDIN', 'GITHUB', 'PORTFOLIO']],
  ['summary', ['SUMMARY']],
  ['objective', ['OBJECTIVE']],
  ['about', ['ABOUT']],
  ['education', ['EDUCATION']],
  ['experience', ['EXPERIENCE']],
  ['projects', ['PROJECTS']],
  ['skills', ['SKILLS']],
  ['certifications', ['CERTIFICATIONS']],
  ['activities', ['ACTIVITIES']],
  ['volunteer', ['VOLUNTEER']],
  ['interests', ['INTERESTS']],
];

export const TemplateService = {
  // Get all templates accessible to user (or every template, for the public gallery)
  async getTemplates(userPlan: string, includeAll = false): Promise<TemplateDetails[]> {
    const includePro = includeAll || userPlan === 'pro';
    const templates = await TemplateModel.findAll(includePro);
    return templates.map((template) => this.withDetails(template));
  },

  // Get single template
  async getTemplate(id: string): Promise<TemplateDetails> {
    const template = await TemplateModel.findById(id);
    if (!template) {
      throw new NotFoundError('Template not found');
    }
    return this.withDetails(template);
  },

  withDetails(template: Template): TemplateDetails {
    return { ...template, slug: this.slug(template), sections: this.getSections(template) };
  },

  // File name without extension, e.g. 'minimal-tech'
  slug(template: Template): string {
    return (template.tex_path.split('/').pop() || '').replace(/\.tex$/, '');
  },

  readTemplateFile(template: Template): string {
    return readFileSync(join(__dirname, '../../templates', `${this.slug(template)}.tex`), 'utf8');
  },

  // Sections the template has a placeholder for, in interview order
  getSections(template: Template): ResumeSectionKey[] {
    const source = this.readTemplateFile(template);
    return SECTION_PLACEHOLDERS
      .filter(([, placeholders]) => placeholders.some((p) => source.includes(`{{${p}}}`)))
      .map(([key]) => key);
  },

  // Populate template with form data
  async populateTemplate(templateId: string, formData: ResumeFormData): Promise<string> {
    const template = await this.getTemplate(templateId);

    // Read the template file
    let latexSource = this.readTemplateFile(template);

    // Replace personal info placeholders
    latexSource = latexSource.replace(/{{NAME}}/g, this.escapeLatex(formData.personal.name || ''));
    latexSource = latexSource.replace(/{{EMAIL}}/g, this.escapeLatex(formData.personal.email || ''));
    latexSource = latexSource.replace(/{{PHONE}}/g, this.escapeLatex(formData.personal.phone || ''));
    latexSource = latexSource.replace(/{{LOCATION}}/g, this.escapeLatex(formData.personal.location || ''));
    
    // Format LinkedIn, GitHub, Website/Portfolio
    const linkedin = formData.personal.linkedin 
      ? `LinkedIn: \\href{${this.escapeLatex(formData.personal.linkedin)}}{${this.escapeLatex(formData.personal.linkedin)}}`
      : '';
    const github = formData.personal.github
      ? `GitHub: \\href{${this.escapeLatex(formData.personal.github)}}{${this.escapeLatex(formData.personal.github)}}`
      : '';
    const portfolio = formData.personal.website
      ? `Portfolio: \\href{${this.escapeLatex(formData.personal.website)}}{${this.escapeLatex(formData.personal.website)}}`
      : '';
    
    latexSource = latexSource.replace(/{{LINKEDIN}}/g, linkedin);
    latexSource = latexSource.replace(/{{GITHUB}}/g, github);
    latexSource = latexSource.replace(/{{PORTFOLIO}}/g, portfolio);

    // Populate optional text fields (summary, objective, about, interests)
    // Single contact line that skips empty fields: phone | email | location | links
    latexSource = latexSource.split('{{CONTACT}}').join(this.contactLine(formData.personal));

    // Text sections: empty ones are dropped rather than filled with generic filler
    latexSource = this.fillTextSection(latexSource, 'SUMMARY', formData.summary);
    latexSource = this.fillTextSection(latexSource, 'OBJECTIVE', formData.objective);
    latexSource = this.fillTextSection(latexSource, 'ABOUT', formData.about);
    latexSource = this.fillTextSection(latexSource, 'INTERESTS', formData.interests);

    // Populate education
    const educationItems = formData.education.map(edu => {
      const location = edu.location ? edu.location : '';
      // A bare number reads as a GPA; values like "88%" or "8.7 CGPA" already say what they are
      const score = (edu.gpa || '').trim();
      const gpa = score
        ? ` -- ${/^[\d.]+$/.test(score) ? 'GPA: ' : ''}${this.escapeLatex(score)}`
        : '';
      return `    \\resumeSubheading
      {${this.escapeLatex(edu.institution)}}{${this.escapeLatex(location)}}
      {${this.escapeLatex(edu.degree)}${gpa}}{${this.escapeLatex(edu.graduation_year)}}`;
    }).join('\n');
    
    latexSource = this.fillSection(latexSource, 'EDUCATION', educationItems);

    // Populate experience
    const experienceItems = formData.experience.map(exp => {
      const location = exp.location ? exp.location : '';
      const highlights = (exp.highlights || []).filter(h => h.trim());
      // An itemize with no \item fails to compile, so omit the list when there are no highlights
      const highlightList = highlights.length
        ? `
      \\resumeItemListStart
${highlights.map(h => `        \\resumeItem{${this.escapeLatex(h)}}`).join('\n')}
      \\resumeItemListEnd`
        : '';

      return `    \\resumeSubheading
      {${this.escapeLatex(exp.role)}}{${this.escapeLatex(exp.duration)}}
      {${this.escapeLatex(exp.company)}}{${this.escapeLatex(location)}}${highlightList}`;
    }).join('\n');
    
    latexSource = this.fillSection(latexSource, 'EXPERIENCE', experienceItems);

    // Populate projects
    const projectItems = formData.projects.map(proj => {
      const link = proj.link ? ` $|$ \\small ${this.linkMarkup(proj.link)}` : '';
      const tech = (proj.tech_stack || []).join(', ');
      
      return `    \\resumeSubheading
      {${this.escapeLatex(proj.name)}${link}}{}
      {${this.escapeLatex(tech)}}{}
      \\resumeItemListStart
        \\resumeItem{${this.escapeLatex(proj.description)}}
      \\resumeItemListEnd`;
    }).join('\n');
    
    latexSource = this.fillSection(latexSource, 'PROJECTS', projectItems);

    // Populate skills
    const skillItems = formData.skills.map(skillGroup => {
      const items = (skillGroup.items || []).join(', ');
      return `    \\item \\textbf{${this.escapeLatex(skillGroup.category)}:} ${this.escapeLatex(items)}`;
    }).join('\n');
    
    latexSource = this.fillSection(latexSource, 'SKILLS', skillItems);

    // Populate certifications (if exists in formData)
    const certifications = (formData as any).certifications || [];
    const certificationItems = certifications.map((cert: any) => {
      return `    \\resumeSubheading
      {${this.escapeLatex(cert.name)}}{${this.escapeLatex(cert.date || '')}}
      {${this.escapeLatex(cert.issuer || '')}}{${this.escapeLatex(cert.credential_id || '')}}`;
    }).join('\n');
    latexSource = this.fillSection(latexSource, 'CERTIFICATIONS', certificationItems);

    // Populate activities (for fresher template)
    const activities = (formData as any).activities || [];
    const activityItems = activities.map((activity: any) => {
      return `    \\resumeSubheading
      {${this.escapeLatex(activity.name)}}{${this.escapeLatex(activity.duration || '')}}
      {${this.escapeLatex(activity.role || '')}}{${this.escapeLatex(activity.description || '')}}`;
    }).join('\n');
    latexSource = this.fillSection(latexSource, 'ACTIVITIES', activityItems);

    // Populate volunteer work (for career-changer template)
    const volunteer = (formData as any).volunteer || [];
    const volunteerItems = volunteer.map((vol: any) => {
      return `    \\resumeSubheading
      {${this.escapeLatex(vol.organization)}}{${this.escapeLatex(vol.duration || '')}}
      {${this.escapeLatex(vol.role || '')}}{${this.escapeLatex(vol.description || '')}}`;
    }).join('\n');
    latexSource = this.fillSection(latexSource, 'VOLUNTEER', volunteerItems);

    return latexSource;
  },

  // Clickable link that displays the URL without scheme or www, e.g. github.com/name
  linkMarkup(url?: string): string {
    const value = (url || '').trim();
    if (!value) return '';
    const display = value.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    const href = /^https?:\/\//.test(value) ? value : `https://${value}`;
    return `\\href{${this.escapeUrl(href)}}{${this.escapeLatex(display)}}`;
  },

  contactLine(personal: ResumeFormData['personal']): string {
    const link = (url?: string) => this.linkMarkup(url);
    const email = (personal.email || '').trim();
    return [
      this.escapeLatex(personal.phone || ''),
      email ? `\\href{mailto:${this.escapeUrl(email)}}{${this.escapeLatex(email)}}` : '',
      this.escapeLatex(personal.location || ''),
      link(personal.linkedin),
      link(personal.github),
      link(personal.website),
    ]
      .filter(Boolean)
      .join(' $|$ ');
  },

  // Fill a paragraph placeholder, or drop its \section (heading and paragraph line) when empty
  fillTextSection(latexSource: string, placeholder: string, text?: string): string {
    const token = `{{${placeholder}}}`;
    const value = (text || '').trim();
    if (value) {
      return latexSource.split(token).join(this.escapeLatex(value));
    }

    let result = latexSource;
    let tokenIndex = result.indexOf(token);
    while (tokenIndex !== -1) {
      const sectionStart = result.lastIndexOf('\\section', tokenIndex);
      const lineEnd = result.indexOf('\n', tokenIndex);
      const end = lineEnd === -1 ? result.length : lineEnd + 1;
      result = sectionStart === -1
        ? result.replace(token, '')
        : result.slice(0, sectionStart) + result.slice(end);
      tokenIndex = result.indexOf(token);
    }
    return result;
  },

  // Characters that break \href's URL argument
  escapeUrl(url: string): string {
    return url.replace(/\\/g, '/').replace(/([%#{}])/g, '\\$1');
  },

  // Fill a list placeholder, or drop its whole \section when there are no entries:
  // the placeholder sits inside an itemize, and an itemize with no \item fails to compile
  fillSection(latexSource: string, placeholder: string, content: string): string {
    const token = `{{${placeholder}}}`;
    if (content) {
      // split/join rather than replace() so `$` sequences in user content are not treated as patterns
      return latexSource.split(token).join(content);
    }

    let result = latexSource;
    let tokenIndex = result.indexOf(token);
    while (tokenIndex !== -1) {
      const sectionStart = result.lastIndexOf('\\section', tokenIndex);
      const listEnd = /\\resumeSubHeadingListEnd|\\resumeItemListEnd|\\end\{itemize\}/g;
      listEnd.lastIndex = tokenIndex;
      const endMatch = listEnd.exec(result);

      if (sectionStart === -1 || !endMatch) {
        // Unrecognised layout: fall back to removing just the placeholder
        result = result.replace(token, '');
      } else {
        const lineEnd = result.indexOf('\n', endMatch.index);
        result = result.slice(0, sectionStart) + result.slice(lineEnd === -1 ? result.length : lineEnd + 1);
      }
      tokenIndex = result.indexOf(token);
    }
    return result;
  },

  // Escape special LaTeX characters
  escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  },
};
