# AGENT.md — Instructions for the ResumeX Build Agent

You are extending an **existing** project, not starting a new one. Read this
file and `SPECS.md` fully before writing or editing any code.

## Step 0 — Mandatory Frontend Audit (do this before writing ANY new code)

Before generating or modifying anything, inspect `Resumex-App/Resumex/` end to end:

1. List every route/page and identify the routing pattern (App Router vs Pages Router).
2. Read `tailwind.config.*` — extract the color palette, font families, and
   spacing/breakpoint customizations already defined. Reuse these tokens.
   Do not invent new colors/spacing without first adding them to the config.
3. Inventory shared components (buttons, inputs, cards, modals, layout shells,
   nav). Reuse them as-is. If something needed doesn't exist yet, build it to
   match the props/style pattern of its closest existing sibling.
4. Identify existing state management (Context/Zustand/Redux/none) and data
   fetching pattern (fetch/axios/SWR/React Query). Match what's already there
   — do not introduce a second pattern alongside it.
5. Check for any stubbed or mocked `fetch('/api/...')` calls already present
   in the UI. These define a contract the backend must satisfy. Cross-check
   them against `API_SPEC.md` and flag mismatches rather than silently
   resolving them in one direction.
6. Check `package.json` for exact framework/library versions already
   installed (Next.js, React, TypeScript, CodeMirror/Monaco, form libraries).
   Build with what's already there before adding new dependencies.

Do not begin building new screens or wiring real data until this audit is done.

## UI Consistency Rules
- Extend `tailwind.config`, never hardcode one-off style values that bypass it.
- New files live in the same folder structure and naming convention as existing ones.
- Match existing spacing, typography scale, and component composition exactly.
- If the existing UI already uses a specific editor/form library, keep using
  it — don't swap libraries mid-project even if you'd prefer a different one.

## Docker-First Rule
- Every new service (backend, Postgres, LaTeX compiler) must run via
  `docker compose up` from the repo root with no manual local installs.
- A feature is not "done" until it works inside Docker, not just on bare metal.
- Do not add AWS/Vercel/cloud-specific SDK calls yet — that's a later,
  explicitly separate production phase.

## Environment & Secrets
- Read all credentials from `.env` (see `.env.example` for the full list).
- Never hardcode a key or commit a real `.env` file.
- If a new feature needs a new env var, add a placeholder to `.env.example`
  and document it in `ENV_AND_API_KEYS.md` — don't let undocumented secrets
  creep in.

## Build Order
Follow this order; don't jump ahead to Post-MVP items before MVP works end to end.

1. Backend scaffold (Express + TypeScript) + Postgres schema (`DATABASE_SCHEMA.md`) + Docker Compose wiring
2. Auth (email/password, JWT) wired into existing login/signup screens
3. Multi-step data-collection form → persists to Postgres (match existing form UI, or build to match Step 0 findings if it doesn't exist yet)
4. Template library (5–10 static `.tex` files) + data population engine
5. LaTeX compiler microservice (Dockerized, sandboxed) + editor/preview wiring
6. Dashboard: list / fork / delete / download
7. **Only after 1–6 are fully working:** AI chatbot, template suggester, ATS checker, cover letter generator, Stripe

## Definition of Done (per feature)
- Runs via `docker compose up` with no manual steps beyond `.env` setup
- Visually and structurally consistent with the Step 0 audit findings
- DB changes are captured as a migration file, not applied ad hoc
- No secrets hardcoded anywhere in the diff