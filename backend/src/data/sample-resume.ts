import { ResumeFormData } from '../types';

// Fictional resume used to render template preview images
export const SAMPLE_RESUME: ResumeFormData = {
  personal: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 555 0142',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    website: 'alexmorgan.dev',
  },
  summary:
    'Full-stack engineer with 4 years of experience building data-heavy web products. Shipped features used by 2M+ users and cut infrastructure costs by 30% through performance work.',
  objective:
    'Software engineer moving into product-focused roles where I can pair technical depth with user research.',
  about:
    'I build fast, accessible web apps and love turning messy data into clear interfaces. Outside work I mentor first-time contributors to open source.',
  interests: 'Trail running, film photography, open-source mentoring',
  education: [
    {
      degree: 'B.S. in Computer Science',
      institution: 'University of Texas at Austin',
      graduation_year: '2021',
      gpa: '3.8',
      location: 'Austin, TX',
    },
  ],
  experience: [
    {
      role: 'Software Engineer',
      company: 'Brightline Analytics',
      duration: 'Jan 2023 -- Present',
      location: 'Austin, TX',
      highlights: [
        'Led migration of reporting dashboards to Next.js, cutting page load time by 45%',
        'Designed a caching layer that reduced cloud costs by 30% (\$120K per year)',
        'Mentored 3 junior engineers through code reviews and pairing sessions',
      ],
    },
    {
      role: 'Junior Developer',
      company: 'Northwind Labs',
      duration: 'Jun 2021 -- Dec 2022',
      location: 'Remote',
      highlights: [
        'Built REST APIs in Node.js serving 5M requests per day',
        'Introduced automated testing that raised coverage from 40% to 85%',
      ],
    },
  ],
  projects: [
    {
      name: 'TrailMap',
      description: 'Offline-first trail planner with live elevation profiles, 10K monthly users',
      tech_stack: ['React Native', 'TypeScript', 'Mapbox'],
      link: 'https://github.com/alexmorgan/trailmap',
    },
    {
      name: 'Ledgerly',
      description: 'Open-source budgeting app with bank sync and spending insights',
      tech_stack: ['Next.js', 'PostgreSQL', 'Prisma'],
    },
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL'] },
    { category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Express'] },
    { category: 'Tools', items: ['Docker', 'AWS', 'PostgreSQL', 'GitHub Actions'] },
  ],
  certifications: [
    { name: 'AWS Certified Developer -- Associate', issuer: 'Amazon Web Services', date: '2024' },
  ],
  activities: [
    { name: 'Women Who Code Austin', role: 'Volunteer Mentor', duration: '2022 -- Present', description: 'Run monthly web development workshops' },
  ],
  volunteer: [
    { organization: 'Code for Austin', role: 'Frontend Lead', duration: '2023 -- Present', description: 'Built a civic transit-alerts site for 20K residents' },
  ],
};

const SAMPLE_DATA_SCIENTIST: ResumeFormData = {
  personal: {
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    phone: '+1 555 0187',
    location: 'Seattle, WA',
    linkedin: 'linkedin.com/in/jordanlee',
    github: 'github.com/jordanlee',
  },
  summary:
    'Data scientist with 5 years of experience shipping ML models for pricing and demand forecasting. Built models that added \$4M in annual revenue and cut forecast error by 22%.',
  education: [
    { degree: 'M.S. in Statistics', institution: 'University of Washington', graduation_year: '2020', location: 'Seattle, WA' },
    { degree: 'B.S. in Mathematics', institution: 'UC San Diego', graduation_year: '2018', location: 'San Diego, CA' },
  ],
  experience: [
    {
      role: 'Senior Data Scientist',
      company: 'Cascade Retail',
      duration: 'Mar 2022 -- Present',
      location: 'Seattle, WA',
      highlights: [
        'Built a gradient-boosted pricing model across 40K SKUs, adding \$4M in annual revenue',
        'Reduced weekly demand forecast error (MAPE) by 22% with hierarchical time-series models',
        'Deployed models to production on SageMaker with automated drift monitoring',
      ],
    },
    {
      role: 'Data Scientist',
      company: 'Northpeak Insurance',
      duration: 'Jul 2020 -- Feb 2022',
      location: 'Remote',
      highlights: [
        'Developed a churn model that let retention teams save 8% of at-risk policies',
        'Automated monthly reporting in Python and dbt, saving analysts 30 hours per month',
      ],
    },
  ],
  projects: [
    {
      name: 'Open Transit Delays',
      description: 'Public dashboard predicting bus delays from GTFS feeds, 15K monthly visitors',
      tech_stack: ['Python', 'XGBoost', 'Streamlit'],
    },
  ],
  skills: [
    { category: 'Languages', items: ['Python', 'SQL', 'R'] },
    { category: 'Machine Learning', items: ['scikit-learn', 'XGBoost', 'PyTorch', 'Time-series forecasting'] },
    { category: 'Data & MLOps', items: ['Spark', 'dbt', 'Airflow', 'SageMaker', 'Snowflake'] },
  ],
  certifications: [{ name: 'AWS Certified Machine Learning -- Specialty', issuer: 'Amazon Web Services', date: '2023' }],
};

const SAMPLE_BUSINESS: ResumeFormData = {
  personal: {
    name: 'Sofia Martinez',
    email: 'sofia.martinez@example.com',
    phone: '+1 555 0123',
    location: 'Chicago, IL',
    linkedin: 'linkedin.com/in/sofiamartinez',
  },
  summary:
    'Marketing and operations leader with 9 years of experience growing B2B SaaS revenue. Led teams of up to 14 and grew pipeline 3x through data-driven campaigns and sales alignment.',
  education: [
    { degree: 'MBA, Marketing', institution: 'Northwestern University (Kellogg)', graduation_year: '2017', location: 'Evanston, IL' },
    { degree: 'B.A. in Economics', institution: 'University of Illinois', graduation_year: '2013', location: 'Urbana, IL' },
  ],
  experience: [
    {
      role: 'Director of Marketing',
      company: 'Brightpath Software',
      duration: 'Jan 2021 -- Present',
      location: 'Chicago, IL',
      highlights: [
        'Grew qualified pipeline 3x (\$6M to \$18M) in two years through account-based campaigns',
        'Built and led a 14-person team across demand generation, content and product marketing',
        'Cut customer acquisition cost by 28% by reallocating budget to the best-performing channels',
      ],
    },
    {
      role: 'Senior Marketing Manager',
      company: 'Lakeshore Analytics',
      duration: 'Jun 2017 -- Dec 2020',
      location: 'Chicago, IL',
      highlights: [
        'Launched 3 product lines that reached \$5M in combined first-year revenue',
        'Introduced a lead-scoring model with sales, raising conversion to opportunity by 35%',
      ],
    },
  ],
  projects: [],
  skills: [
    { category: 'Leadership', items: ['Team building', 'Budget ownership (\$4M)', 'Cross-functional alignment'] },
    { category: 'Marketing', items: ['Demand generation', 'Account-based marketing', 'Product launches', 'Brand strategy'] },
    { category: 'Tools', items: ['Salesforce', 'HubSpot', 'Google Analytics', 'Tableau'] },
  ],
  certifications: [{ name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', date: '2022' }],
  volunteer: [
    { organization: 'Junior Achievement Chicago', role: 'Board Member', duration: '2020 -- Present', description: 'Advise on fundraising strategy' },
  ],
};

const SAMPLE_GRADUATE: ResumeFormData = {
  personal: {
    name: 'Aisha Khan',
    email: 'aisha.khan@example.com',
    phone: '+1 555 0166',
    location: 'Boston, MA',
    linkedin: 'linkedin.com/in/aishakhan',
    github: 'github.com/aishakhan',
  },
  objective:
    'Computer science graduate seeking a software engineering role building reliable, user-focused web products.',
  education: [
    { degree: 'B.S. in Computer Science', institution: 'Northeastern University', graduation_year: 'May 2026', gpa: '3.7', location: 'Boston, MA' },
  ],
  experience: [
    {
      role: 'Software Engineering Intern',
      company: 'Harborview Health',
      duration: 'May 2025 -- Aug 2025',
      location: 'Boston, MA',
      highlights: [
        'Built a React appointment-scheduling flow used by 3 clinics, cutting no-shows by 12%',
        'Wrote integration tests that caught 9 regressions before release',
      ],
    },
  ],
  projects: [
    {
      name: 'StudySync',
      description: 'Real-time study group planner with shared calendars, 600 student users',
      tech_stack: ['Next.js', 'TypeScript', 'Supabase'],
      link: 'https://github.com/aishakhan/studysync',
    },
    {
      name: 'Campus Eats',
      description: 'Dining hall menu API and mobile app with dietary filters',
      tech_stack: ['Node.js', 'Express', 'React Native'],
    },
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'Python', 'Java', 'SQL'] },
    { category: 'Frameworks & Tools', items: ['React', 'Next.js', 'Node.js', 'Git', 'Docker'] },
  ],
  certifications: [],
  activities: [
    { name: 'Women in Tech Society', role: 'President', duration: '2024 -- 2026', description: 'Grew membership from 40 to 120' },
  ],
};

// Sample that suits a template's audience, chosen by its tags
export const sampleFor = (tags: string[]): ResumeFormData => {
  if (tags.includes('data')) return SAMPLE_DATA_SCIENTIST;
  if (tags.some((tag) => ['business', 'leadership', 'non-tech'].includes(tag))) return SAMPLE_BUSINESS;
  if (tags.some((tag) => ['fresher', 'student', 'graduate'].includes(tag))) return SAMPLE_GRADUATE;
  return SAMPLE_RESUME;
};
