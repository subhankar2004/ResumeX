# ResumeX — Backend API

Express + TypeScript REST API for ResumeX: auth (email/password, Google, GitHub), resumes, the LaTeX template engine, compile orchestration and the Rex AI endpoints.

```
src/
├── routes/        URL → handler, auth middleware
├── controllers/   request validation, responses
├── services/      business logic (auth, oauth, resume, template engine, compile, ai, resume-writer)
├── models/        parameterised SQL via a shared pg pool
├── middleware/    JWT verification
├── utils/         errors, response envelope, migration runner
├── data/          sample resumes for template previews
└── scripts/       migrate, render-previews
migrations/        numbered SQL, applied on startup
templates/         .tex templates with {{PLACEHOLDERS}}
```

Scripts (run inside the container, e.g. `docker compose exec backend npm run <script>`):

| Script | Purpose |
| --- | --- |
| `dev` | nodemon + ts-node (the container's default command) |
| `build` / `start` | Compile to `dist/` and run it |
| `migrate` | Apply pending migrations |
| `render-previews` | Compile every template with sample data into `template-previews/` |

See the [root README](../README.md) for setup and the full API overview.
