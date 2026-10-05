# API_SPEC.md — ResumeX Backend REST Contract

Base URL (dev): `http://localhost:4000/api`
Auth: `Authorization: Bearer <JWT>` on all routes except `/auth/*`.

> ⚠️ Before implementing, cross-check this against any `fetch()` calls already
> stubbed in the existing frontend (see AGENT.md Step 0). If the frontend
> already expects a different shape, that existing contract wins — update
> this file to match, don't silently break the UI.

## Auth
- `POST /auth/signup` → `{ email, password }` → `{ token, user }`
- `POST /auth/login` → `{ email, password }` → `{ token, user }`
- `GET /auth/me` → `{ user }`
- `GET /auth/github`, `GET /auth/google` → browser redirect to the provider's consent screen (sets a short-lived `oauth_state` cookie)
- `GET /auth/github/callback`, `GET /auth/google/callback` → the provider redirects here; on success redirects to
  `{FRONTEND_URL}/auth/callback#token=<JWT>`, on failure to `{FRONTEND_URL}/login?error=<message>`

## Profile
- `PATCH /users/me/profile` → `{ profile_type }` → `{ user }`

## Templates
- `GET /templates` → `[{ id, name, description, tags, is_pro_only, slug, sections }]` (`?all=true` includes Pro templates for browsing; `slug` names the preview image in `ResumeX/public/templates/`, `sections` lists the resume sections the template uses)
- `GET /templates/:id` → full template metadata (not the raw `.tex`, that's internal)

## Resumes
- `GET /resumes` → list of the current user's resumes (id, title, updated_at, template_id)
- `POST /resumes` → `{ title, template_id, form_data, interview? }` → creates resume, populates `.tex` from template → `{ resume }`. Free plan: max 2 resumes.
- `GET /resumes/:id` → full resume incl. `latex_source`, `interview` (the saved Rex chat: `{ messages, form_data, done }` or null) and `has_manual_edits` (LaTeX differs from what `form_data` generates)
- `PATCH /resumes/:id` → update `title`, `form_data` (regenerates `latex_source` unless one is sent), `latex_source` and/or `interview`
- `POST /resumes/:id/fork` → duplicates a resume (incl. its chat), sets `forked_from`; counts toward the free limit
- `DELETE /resumes/:id`

## Compile
- `POST /resumes/:id/compile` → `{ latex_source }` (current editor content) →
  on success: `{ pdf_url }` or raw PDF bytes (`application/pdf`)
  on failure: `{ error, compiler_log }`

## AI
- `GET /ai/status` → `{ available }` (false when `GEMINI_API_KEY` is unset)
- `POST /ai/interview` → `{ template_id, messages: [{ role: "user"|"assistant", content }], form_data }` →
  `{ reply, form_data, done }`. Stateless: the client sends the whole conversation and current
  `form_data` each turn (≤ 80 messages, ≤ 2000 chars each). An empty `messages` array returns the greeting.

- `POST /ai/polish` → `{ template_id, form_data, messages?, job_description? }` → `{ form_data, suggestions }`.
  Rex Writer rewrites wording for ATS (summary, impact bullets, skills, project lines). The server
  locks facts: personal details, titles, companies, dates, education and certifications come from the
  input unchanged, a rewrite containing a number the candidate never gave is discarded, and skills
  must match something the candidate mentioned.

Not built yet:
- `POST /ai/suggest-template` → `{ profile_type, form_data }` → ranked template ids
- `POST /ai/rewrite` → `{ text, instruction }` → rewritten bullet point
- `POST /ai/ats-score` → `{ resume_id, job_description }` → `{ score, missing_keywords }`
- `POST /ai/cover-letter` → `{ resume_id, job_description }` → generated letter text

## Subscriptions (Post-MVP)
- `POST /billing/checkout-session` → Stripe Checkout session URL
- `POST /billing/webhook` → Stripe webhook handler