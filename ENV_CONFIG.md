# Environment Configuration Guide

This document explains all environment variables used in ResumeX.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your configuration.

3. **Never commit `.env` to version control!** (It's already in `.gitignore`)

## Environment Variables

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `4000` | No |
| `NODE_ENV` | Environment mode | `development` | No |

### Database (PostgreSQL)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_HOST` | Database host | `db` | Yes |
| `POSTGRES_PORT` | Database port | `5432` | Yes |
| `POSTGRES_DB` | Database name | `resumex_db` | Yes |
| `POSTGRES_USER` | Database user | `resumex` | Yes |
| `POSTGRES_PASSWORD` | Database password | `resumex_dev_password` | Yes |

⚠️ **Important**: Change the default password in production!

### JWT Authentication

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for signing JWTs | ⚠️ Must change | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` | No |

⚠️ **Security**: Generate a strong random string for `JWT_SECRET` in production:
```bash
openssl rand -base64 32
```

### LaTeX Compiler Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LATEX_COMPILER_URL` | Internal URL of compiler service | `http://latex-compiler:5001` | Yes |
| `LATEX_COMPILE_TIMEOUT` | Max compilation time (ms) | `10000` | No |

### CORS

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGIN` | Allowed origin for CORS | `http://localhost:3000` | Yes |

In production, set this to your frontend domain (e.g., `https://resumex.com`).

### OAuth (social sign-in)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_PUBLIC_URL` | Backend URL as seen by the browser; OAuth callback URLs are built from it | `http://localhost:4000` | No |
| `FRONTEND_URL` | Where the backend sends the browser after sign-in | `CORS_ORIGIN` | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID | — | For GitHub sign-in |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret | — | For GitHub sign-in |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (ends in `.apps.googleusercontent.com`) | — | For Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (starts with `GOCSPX-`) | — | For Google sign-in |

Create the GitHub OAuth App at GitHub → Settings → Developer settings → OAuth Apps, with:
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:4000/api/auth/github/callback`

Create the Google client at Google Cloud Console → Google Auth Platform → Clients → Create client (Web application), with:
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`
- While the app's audience is in "Testing", add each Google account that should sign in under Audience → Test users.

The backend reads `.env` only when its container is created, so run `docker compose up -d backend` after changing these.

### Frontend (Next.js)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000/api` | Yes |

⚠️ Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Post-MVP Variables (Optional)

These are for features not yet implemented in MVP:

### Gemini AI (resume interviewer)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key; without it the interviewer is hidden and users get the plain form | — | For the AI interviewer |
| `GEMINI_MODEL` | Gemini model used for the interview | `gemini-3.5-flash-lite` | No |
| `GEMINI_THINKING_LEVEL` | How much the model reasons before replying (`minimal`, `low`, `medium`, `high`); higher is slower | `minimal` | No |
| `AI_TIMEOUT` | Max time per AI request (ms) | `30000` | No |
| `GEMINI_WRITER_MODEL` | Model for Rex Writer, the one-off ATS rewrite on build/update. `gemini-3.5-flash` writes slightly richer text but takes ~20s vs ~3s | `gemini-3.5-flash-lite` | No |
| `GEMINI_WRITER_THINKING_LEVEL` | Thinking level for Rex Writer (`minimal` spells numbers out, so keep `low` or higher) | `low` | No |
| `AI_WRITER_TIMEOUT` | Max time for a Rex Writer request (ms) | `60000` | No |

Get your API key from Google AI Studio: https://aistudio.google.com/apikey

### Stripe Payments (Post-MVP)

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No |

Get your keys from: https://dashboard.stripe.com/apikeys

## Development vs Production

### Development (Local Docker)
Use the defaults in `.env.example`. They work out of the box with `docker-compose up`.

### Production
1. Generate secure random values for secrets
2. Use strong database passwords
3. Update `CORS_ORIGIN` to your actual domain
4. Set `NODE_ENV=production`
5. Use managed database (not the Docker container)
6. Enable HTTPS

## Troubleshooting

### "Connection refused" errors
- Check that service names in docker-compose match the hostnames in `.env`
- For backend → latex-compiler: use `http://latex-compiler:5001`
- For frontend → backend: use `http://localhost:4000/api` (from browser)

### JWT errors
- Ensure `JWT_SECRET` is set and consistent across restarts
- Check that `JWT_EXPIRES_IN` format is valid (e.g., '7d', '24h', '1y')

### Database connection errors
- Verify PostgreSQL service is running
- Check credentials match between `.env` and docker-compose.yml
- Wait a few seconds after starting containers for DB to initialize

## Docker Compose Environment

Docker Compose automatically reads `.env` from the project root. Variables are available to all services.

To override a variable temporarily:
```bash
PORT=5000 docker-compose up backend
```

To see resolved values:
```bash
docker-compose config
```
