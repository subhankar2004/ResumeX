# ResumeX — Product & Feature Specification

## 1. Product Summary
ResumeX is an AI-assisted, LaTeX-powered resume builder SaaS. It wraps a LaTeX
typesetting engine (Overleaf-style) in a guided, form-based data collection flow,
suggests ATS-friendly templates, and gives users a live code editor + PDF preview
to fine-tune their resume before download.

## 2. User Roles
- **Guest** — can browse marketing pages, cannot save data.
- **Free User** — 1 resume, limited template set, no AI features.
- **Pro User** — unlimited resumes, full template library, AI chatbot, writing
  assistant, ATS checker, cover letter generator (all Post-MVP).
- **Admin** (internal only, not user-facing yet) — manage template library.

## 3. Core User Flow (MVP)
1. Sign up / log in (email+password to start; social login is Post-MVP).
2. Select profile type: Fresher / Experienced / Tech / Non-Tech.
3. Fill multi-step form: Personal Details → Education → Experience → Skills → Projects.
4. Select a template from the curated library (5–10 templates).
5. Backend populates the `.tex` template with form data.
6. Two-panel editor opens: left = LaTeX source (CodeMirror/Monaco), right = PDF preview.
7. User edits code → clicks Compile → backend runs the sandboxed LaTeX compiler → PDF refreshes.
8. Dashboard: view, fork, rename, delete, download saved resumes.

## 4. MVP Feature List
- [ ] Email/password auth (JWT-based sessions)
- [ ] Profile-type selection screen
- [ ] Multi-step data collection form, persisted to Postgres
- [ ] Curated library of 5–10 pre-built `.tex` templates
- [ ] Data population engine (form data → filled `.tex` string)
- [ ] Embedded LaTeX code editor (CodeMirror or Monaco — match whatever the
      existing frontend already has installed)
- [ ] Dockerized, sandboxed `pdflatex` compile microservice
- [ ] PDF preview pane + download button
- [ ] Dashboard: list / fork / delete saved resumes

## 5. Post-MVP Feature List (build only after MVP is fully working end-to-end)
- AI chatbot data collection (Gemini API) — parses free text into structured fields
- AI template suggester — recommends templates from profile + content signals
- Advanced editor: syntax highlighting, compiler error surfacing, auto-compile
- Resume versioning / forking for different job applications
- AI writing assistant — rephrase/quantify highlighted bullet points
- ATS score checker — compares resume against a pasted job description
- Cover letter generator
- Subscription tiers via Stripe (Free / Pro)
- Public shareable resume URLs

## 6. Non-Functional Requirements
- **Compile sandboxing is non-negotiable:** time-limited (~10s), memory-limited,
  no network access from inside the compiler container, `shell-escape` disabled,
  runs as a non-root user.
- **Multi-tenant data isolation:** every resume/profile row scoped to `user_id`;
  no cross-user data leakage.
- **Docker-only for now.** Nothing in this phase talks to AWS, Vercel, or any
  managed cloud service — that's deliberately deferred until after MVP validation.
- Backend stays stateless; all persistent state lives in Postgres.

## 7. Current Phase Status
- ✅ Frontend: static Next.js UI already scaffolded in `Resumex/` — this is the
  **source of truth** for the design system. Nothing below should introduce a
  competing visual language.
- ⬜ Backend, database, LaTeX compiler service, and real data wiring — this is
  what the agent builds next, per `AGENT.md`.

## 8. Explicitly Out of Scope for Now
- Any cloud deployment (AWS/Vercel/Netlify) — Docker Compose only until MVP is validated end-to-end.
- Real Stripe billing — test-mode keys only, if/when subscriptions are implemented.
- Production-grade auth (OAuth providers, MFA) — simple email/password + JWT is enough for now.