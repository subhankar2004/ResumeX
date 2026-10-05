# ENV_AND_API_KEYS.md — What Keys You Actually Need, and When

Good news: for the **MVP**, you need almost no paid API keys — the AI
chatbot, template suggester, ATS checker, and Stripe are all Post-MVP per
`SPECS.md`. Everything below is grouped by when you'll actually need it, so
you're not signing up for services before there's code that uses them.

## Needed NOW (Docker / MVP phase)

| Variable | What it's for | How to get it |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Local Postgres container credentials | You choose these yourself — not a real external key, just dev credentials in `.env` |
| `DATABASE_URL` | Backend's connection string to the `db` container | Built from the three vars above, e.g. `postgresql://resumex:resumex_dev_password@db:5432/resumex_db` |
| `JWT_SECRET` | Signs auth tokens | Generate locally: `openssl rand -base64 32` — not an external API key |
| `LATEX_COMPILER_URL` | Internal URL the backend uses to reach the compiler service | `http://latex-compiler:5001` inside Docker Compose — not a secret |

None of these require signing up for any external service — they're all
self-generated or provided by the containers themselves.

## Needed only if you add Google social login (optional, MVP or later)
| Variable | What it's for | How to get it |
|---|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth "Sign in with Google" | Google Cloud Console → APIs & Services → Credentials → OAuth Client ID |

Skip this entirely if email/password auth is enough for now, per SPECS.md.

## Needed once you start Milestone 4 (AI features)
| Variable | What it's for | How to get it |
|---|---|---|
| `GEMINI_API_KEY` | Powers the AI chatbot, template suggester, writing assistant, ATS checker, cover letter generator | Google AI Studio (aistudio.google.com) → Get API key |
| `OPENAI_API_KEY` *(optional alternative)* | Same features, if you'd rather use OpenAI instead of/alongside Gemini | platform.openai.com → API keys |

You don't need either of these until you actually start building the AI
endpoints in `API_SPEC.md` — no point generating them early.

## Needed once you start Milestone 5 (Subscriptions)
| Variable | What it's for | How to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server-side Stripe calls | Stripe Dashboard → Developers → API keys (use **test mode** keys only for now) |
| `STRIPE_PUBLISHABLE_KEY` | Client-side Stripe.js | Same location, test mode |
| `STRIPE_WEBHOOK_SECRET` | Verifies incoming Stripe webhooks | Stripe Dashboard → Webhooks → your endpoint → signing secret |

## Explicitly NOT needed yet
- Any AWS credentials (S3, ECS, Fargate) — deferred until you actually move
  toward production deployment, which SPECS.md marks as out of scope for this phase.
- Any Vercel/Netlify tokens — same reason.
- Email/SMTP provider keys (e.g. Resend, SendGrid) — only needed if you add
  email verification or password reset, which isn't in the MVP list.

See `.env.example` for the actual file to copy to `.env` and fill in.