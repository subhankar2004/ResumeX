Startup Blueprint: AI-Powered LaTeX Resume Builder SaaS

1. Executive Summary & Vision

This document serves as the master blueprint and technical specification for our founding team to build, launch, and scale an AI-Powered LaTeX Resume Builder SaaS.

The Problem

Most job seekers struggle to design professional, highly polished resumes. Standard templates built with graphical editors (Word, Canva) often fail Applicant Tracking Systems (ATS) because of complex layouts, tables, and non-standard text encodings. While LaTeX produces beautifully structured, highly parseable, and professional resumes, writing LaTeX code has a steep learning curve that excludes 99% of candidates.

Our Solution

We are building an intuitive SaaS platform that acts as a user-friendly wrapper over a LaTeX compiler engine (akin to an automated, AI-assisted Overleaf). By combining conversational AI with secure server-side LaTeX compilation, we allow users to build typesetting-grade, high-ATS-score resumes simply by chatting with an AI or filling out a structured form.

2. Target Personas & Dynamic Contexts

To guide both our UI design and the AI's generation logic, we will target five key user segments. The onboarding flow must immediately capture this categorization:

Fresher / Student: Focuses on academic achievements, projects, internships, coursework, and campus leadership. The templates chosen must emphasize potential over historical corporate impact.

Experienced Professional (Tech): Focuses on technical skill matrices, programming languages, architectures, framework experience, and quantitative impact (e.g., "$20\%$ increase in database throughput").

Experienced Professional (Non-Tech): Focuses on leadership, project management, sales targets, customer retention metrics, and organizational growth.

Beginner / Career Changer: Highlights highly transferable skills, self-directed learning, certifications, and bridging projects.

Creative Role: Requires clean yet visually distinct typography, elegant whitespace balances, and optional subtle styling elements.

3. The Core Website Flow

The user journey is designed to minimize friction while progressively collecting clean data to pass to the LaTeX generation engine.

[Onboarding & Profile Setup] 
            │
            ▼
[Data Collection Interface] ──► Option A: Dynamic Multi-Step Form
            │               ──► Option B: Interactive AI Chatbot (Gemini)
            ▼
[AI Template Recommendation Engine] (Scored by Profile & Data Depth)
            │
            ▼
[The Two-Panel Editor Workspace]
 ┌───────────────────────┬────────────────────────┐
 │  Left: Code Editor    │  Right: PDF Preview    │
 │  (CodeMirror / Syntax)│  (Server-Side compiled)│
 └───────────────────────┴────────────────────────┘
            │
            ▼
[Download & Version Management Dashboard]


Step 1: Onboarding & Profile Setup

Authentication: Signup via Google OAuth or Email/Password.

Quick Classification: The user selects their target persona (e.g., "Tech Professional", "Fresher").

Target Goal: The user optionally pastes a target job description (which our post-MVP ATS scorer will use).

Step 2: Dual-Method Data Collection

The Form Interface (Default/MVP): A step-by-step form dividing information into semantic sections: Personal Details, Education, Professional Experience, Projects, Skills (categorized), Languages, Certifications, and Hobbies.

The Conversational Chatbot (AI First): A dynamic chat interface powered by Gemini. The bot asks natural questions like, "Tell me about your most recent role. What were your key responsibilities and achievements?" It extracts structured JSON from free-form text and visually populates the progress indicators on the UI in real-time.

Step 3: AI Template Recommendation

Based on the collected data volume and the persona, the AI scores our template database.

Example: If the user has 15 years of experience, the AI recommends highly compact, two-column layouts. If the user is a fresher, it recommends single-page templates designed to maximize readability with fewer entries.

Step 4: The Core Editor Workspace (The "Overleaf" Experience)

The chosen template is populated with the user's JSON data to generate raw LaTeX code.

The screen splits into two panels:

Left Panel: A robust code editor showing the .tex markup. High-power users can directly write LaTeX, edit formatting parameters, or change fonts.

Right Panel: A sleek canvas showing the rendered PDF.

Manual compilation: A prominent floating action "Compile" button triggers an API request to our sandboxed compiler container, returning the updated PDF.

Step 5: Dashboard & Version Control

Users can manage multiple versions of their resume (e.g., "Software Engineer - Frontend" vs. "Software Engineer - Generalist").

One-click download of the raw PDF or the backup .tex file.

4. Minimum Viable Product (MVP) Scope

To launch rapidly and test our market assumptions, we must strictly define the boundaries of our MVP:

Feature Category

In MVP Scope

Deferred to Post-MVP / Pro Tier

Data Collection

Dynamic multi-step structured forms.

Interactive Gemini Chatbot data intake.

Templates

5 hand-curated, highly optimized LaTeX templates.

30+ Premium templates with creative styling.

Editor

CodeMirror 6 editor with basic manual "Compile" button.

Autosave/Auto-compile on-the-fly & autocomplete.

AI Features

Basic JSON-to-LaTeX template population.

ATS Score Checker, AI Writing Assistant (Bullet-point improver).

Authentication

Email/Password, Simple Google Auth.

GitHub, LinkedIn social logins.

Payments

Free Tier with local compilation.

Stripe subscription plans & paid custom domains.

5. System Architecture & Tech Stack

We need an architecture that is cost-effective at launch but built to scale when traffic spikes.

                     ┌──────────────────┐
                     │  Next.js Client  │
                     │  (Vercel Host)   │
                     └────────┬─────────┘
                              │
                    HTTPS API │ JWT Auth
                              ▼
                     ┌──────────────────┐
                     │  FastAPI Backend │
                     │   (Cloud Run)    │
                     └────┬─────────┬───┘
                          │         │
           DB Read/Write  │         │ Sandbox Exec API (gRPC / HTTP)
                          ▼         ▼
     ┌───────────────────────┐   ┌───────────────────────┐
     │ PostgreSQL (SupaBase) │   │ Dockerized LaTeX Pool │
     │ - User Data (JSONB)   │   │  (Isolated Sandbox)   │
     │ - Subscriptions       │   │  - pdflatex           │
     │ - Template Files      │   │  - Time/Memory Limits │
     └───────────────────────┘   └───────────────────────┘


Detailed Tech Stack

Frontend Web App: Next.js (React 19) hosted on Vercel.

Styling: Tailwind CSS + Shadcn UI for cohesive, responsive design elements.

Editor Component: CodeMirror 6 with custom LaTeX grammar extensions.

Core Backend API: FastAPI (Python). Python is chosen over Node.js due to its native speed with AI/LLM parsing workflows, superior JSON schema handling libraries (Pydantic), and seamless deployment as serverless containers.

Database: PostgreSQL (Managed via Supabase).

We will leverage PostgreSQL's JSONB columns to store nested, unstructured resume data structures. This allows us to modify the resume schema over time without running complex database migrations.

LLM Gateway: Google Gemini API (gemini-2.5-flash-preview-09-2025 model).

High context window, low latency, and highly reliable structured JSON output schemas (responseMimeType: "application/json").

LaTeX Compilation Microservice (The Engine):

Crucial Architectural Design: We must never run LaTeX directly on our web server. Users could write malicious LaTeX packages, execute terminal commands (via \write18), read system files, or construct infinite loops that freeze the server's CPU.

Implementation: We will build a lightweight Go or Python microservice inside a Docker container containing a minimal texlive-latex-extra distribution.

The Sandbox Protocol:

The API backend sends a POST request with the raw LaTeX code string.

The compilation service writes it to a temporary directory inside an ephemeral, read-only Docker container.

The LaTeX command runs with strict limits:

Disable shell escape: pdflatex -shell-escape-disabled -interaction=nonstopmode main.tex

Max execution time: 3 seconds (kill process if exceeded).

Max memory allocation: 128 MB.

Disable network access within the container run configuration.

If compilation succeeds, the .pdf file is streamed back as a byte stream or uploaded to an S3-compatible bucket, and the container is discarded.

If compilation fails, log outputs are parsed to extract only the lines beginning with ! (the specific LaTeX compilation errors) and sent back to display in our left-panel editor.

6. Database Schema Design

This relational schema uses PostgreSQL capabilities to efficiently manage users, versions, and template data.

-- Core Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stripe_subscription_id VARCHAR(255) DEFAULT NULL,
    is_premium BOOLEAN DEFAULT FALSE
);

-- Master Templates Table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'tech', 'non-tech', 'creative', 'academic'
    latex_base_code TEXT NOT NULL, -- The template with placeholders (e.g. {{FULL_NAME}})
    preview_image_url TEXT,
    ats_score_estimate INTEGER DEFAULT 85,
    is_premium_only BOOLEAN DEFAULT FALSE
);

-- User Resume Table (Stores the parsed data and custom code)
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
    
    -- Nested JSON data containing all sections
    resume_data JSONB NOT NULL DEFAULT '{
        "personal": {"name": "", "email": "", "phone": "", "linkedin": ""},
        "education": [],
        "experience": [],
        "skills": [],
        "projects": []
    }'::jsonb,
    
    -- The raw LaTeX string that the user is actively working on
    compiled_latex_code TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


7. AI Prompt Strategy & Structured Outputs

To build the AI chatbot for data collection and template recommendation, we will use Gemini's structured JSON output feature. This ensures the output can be parsed directly into our PostgreSQL JSONB format without complex regular expressions.

Data Collection Parsing System Instruction

System Prompt:
You are an expert resume writer and data extractor. Your job is to parse conversational input from the user and output structured JSON matching the database schema. 

Extract variables with strict adherence to the following JSON structure:
{
  "personal": { "name": string, "email": string, "phone": string, "linkedin": string },
  "experience": [
    { "role": string, "company": string, "duration": string, "highlights": string[] }
  ],
  "education": [
    { "degree": string, "institution": string, "graduation_year": string }
  ],
  "skills": [ { "category": string, "items": string[] } ]
}

If the user provides unstructured or conversational text (e.g., "I spent three years at Netflix building their search UI with React"), reconstruct their experience into bullet points using the STAR method (Situation, Task, Action, Result) and generate the "highlights" array.


8. Week-by-Week Execution Roadmap

This is our agile rollout schedule to build and test the startup platform in 10 weeks.

Phase 1: Foundation (Weeks 1 - 3)

Week 1: Setup shared GitHub repositories. Configure local Docker development environments. Design and deploy the base database on Supabase.

Week 2: Build user authentication flows (Next.js & Supabase). Build the multi-step profile creation form in the UI.

Week 3: DevOps Highlight: Build and test the sandboxed Docker compilation microservice. Ensure it successfully compiles basic .tex inputs and blocks malicious code.

Phase 2: Core Platform (Weeks 4 - 6)

Week 4: Create the dynamic multi-step form for data collection. Design the template placeholder parser that converts user input into compiler-ready LaTeX code.

Week 5: Code up the two-panel Workspace UI. Implement the CodeMirror 6 editor on the left and the PDF rendering canvas on the right. Connect them with the compiler API.

Week 6: Populate the system database with our 5 core MVP templates. Write unit tests for compilation endpoints and user data persistence.

Phase 3: AI Integration & Polish (Weeks 7 - 8)

Week 7: Integrate Gemini API. Build the data-collection chat interface that synchronizes with the database schema.

Week 8: Develop the AI template recommendation logic. Add the AI writing assistant (hover-to-rephrase) to the left-panel code editor.

Phase 4: Launch & Scale (Weeks 9 - 10)

Week 9: Integrate Stripe Checkout for the Premium subscription tier. Add rate-limiting to API endpoints to prevent compilation spam.

Week 10: Conduct end-to-end beta tests with 50 students or friends. Squish bugs, optimize performance, and launch the v1 SaaS platform!