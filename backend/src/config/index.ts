import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '4000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.POSTGRES_HOST || 'db',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    name: process.env.POSTGRES_DB || 'resumex_db',
    user: process.env.POSTGRES_USER || 'resumex',
    password: process.env.POSTGRES_PASSWORD || 'resumex_dev_password',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // LaTeX Compiler Service
  latexCompiler: {
    url: process.env.LATEX_COMPILER_URL || 'http://latex-compiler:5001',
    timeout: parseInt(process.env.LATEX_COMPILE_TIMEOUT || '10000'), // 10 seconds
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // AI (Gemini) for the resume interviewer
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
    // 'minimal' keeps replies around 2s; raise to 'low'/'medium' for more careful writing
    thinkingLevel: process.env.GEMINI_THINKING_LEVEL || 'minimal',
    // Rex Writer: one heavier call per build that rewrites the resume for ATS
    // flash-lite + low thinking ≈3s with near full-model quality; gemini-3.5-flash is richer but ≈20s
    writerModel: process.env.GEMINI_WRITER_MODEL || 'gemini-3.5-flash-lite',
    writerThinkingLevel: process.env.GEMINI_WRITER_THINKING_LEVEL || 'low',
    writerTimeout: parseInt(process.env.AI_WRITER_TIMEOUT || '60000'),
  },

  // OAuth (social sign-in)
  oauth: {
    // Public URLs the browser is redirected to (not Docker-internal hostnames)
    apiPublicUrl: process.env.API_PUBLIC_URL || 'http://localhost:4000',
    frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
};
