# DATABASE_SCHEMA.md — ResumeX (PostgreSQL)

All tables use `uuid` primary keys (`gen_random_uuid()`, via the `pgcrypto`
extension) and `created_at` / `updated_at` timestamps unless noted.

## users
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text UNIQUE NOT NULL | |
| password_hash | text | null if social-login-only (Post-MVP) |
| profile_type | text | `fresher` \| `experienced` \| `tech` \| `non_tech` |
| plan | text NOT NULL DEFAULT 'free' | `free` \| `pro` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## oauth_accounts
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | cascade delete |
| provider | text | `google` \| `github` |
| provider_user_id | text | provider's stable user id; UNIQUE with `provider` |
| email | text | verified email reported by the provider at link time |
| created_at | timestamptz | |

A user can have a password, linked providers, or both. On first social sign-in the
provider's verified email is matched (case-insensitively) to an existing user and
linked; otherwise a password-less user is created.

## schema_migrations
Applied `backend/migrations/*.sql` filenames, maintained by the startup migration runner.

## resumes
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| title | text NOT NULL | user-facing name, e.g. "SWE — Google" |
| template_id | uuid FK → templates.id | |
| form_data | jsonb NOT NULL | structured answers: personal, education, experience, skills, projects |
| latex_source | text | current editable `.tex` content (starts as the populated template) |
| forked_from | uuid FK → resumes.id NULL | set when created via "fork" |
| interview | jsonb NULL | saved Rex chat `{ messages, form_data, done }`; its `form_data` is applied to the resume on "Update my resume" |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## templates
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| description | text | |
| tex_path | text NOT NULL | path to the base `.tex` file on disk/in the templates dir |
| tags | text[] | e.g. `{tech, ats-friendly, minimal}` — used later by the AI suggester |
| is_pro_only | boolean DEFAULT false | |
| ats_score | integer NOT NULL DEFAULT 90 | estimated ATS-friendliness (0-100) from layout; gallery sort order |
| created_at | timestamptz | |

## compile_jobs (optional, useful for debugging/rate-limiting)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| resume_id | uuid FK → resumes.id | |
| status | text | `pending` \| `success` \| `error` |
| error_log | text NULL | raw compiler output on failure |
| duration_ms | integer | |
| created_at | timestamptz | |

## subscriptions (Post-MVP, only needed once Stripe is wired up)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| status | text | `active` \| `canceled` \| `past_due` |
| current_period_end | timestamptz | |

## Notes
- `form_data` as `jsonb` keeps the schema flexible while the form fields are
  still evolving — don't normalize into separate tables until the shape stabilizes.
- Every query that touches `resumes` or `form_data` MUST filter by `user_id`
  to enforce tenant isolation — there is no separate schema-per-tenant here,
  this is a single shared database.