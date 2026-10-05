import type { Metadata } from "next";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { CallToAction } from "@/sections/CallToAction";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Developers — ResumeX AI",
  description:
    "Template placeholders, the ResumeX REST API and how the sandboxed LaTeX compiler works.",
};

const placeholders = [
  { token: "{{NAME}}", description: "Full name" },
  { token: "{{EMAIL}}", description: "Email address" },
  { token: "{{PHONE}}", description: "Phone number" },
  { token: "{{LOCATION}}", description: "City / country" },
  { token: "{{LINKEDIN}}", description: "LinkedIn link (omitted if empty)" },
  { token: "{{GITHUB}}", description: "GitHub link (omitted if empty)" },
  { token: "{{PORTFOLIO}}", description: "Personal website link" },
  { token: "{{SUMMARY}}", description: "Professional summary" },
  { token: "{{EDUCATION}}", description: "\\resumeSubheading entries" },
  { token: "{{EXPERIENCE}}", description: "Roles with \\resumeItem bullets" },
  { token: "{{PROJECTS}}", description: "Projects with tech stack" },
  { token: "{{SKILLS}}", description: "\\item rows grouped by category" },
  { token: "{{CERTIFICATIONS}}", description: "Certification entries" },
];

const endpoints = [
  { method: "POST", path: "/auth/signup", description: "Create an account, returns a JWT" },
  { method: "POST", path: "/auth/login", description: "Exchange credentials for a JWT" },
  { method: "GET", path: "/auth/me", description: "The signed-in user" },
  { method: "PATCH", path: "/users/me/profile", description: "Set profile type" },
  { method: "GET", path: "/templates", description: "Templates available on your plan" },
  { method: "GET", path: "/resumes", description: "List your resumes" },
  { method: "POST", path: "/resumes", description: "Create from a template + form data" },
  { method: "GET", path: "/resumes/:id", description: "Resume with its LaTeX source" },
  { method: "PATCH", path: "/resumes/:id", description: "Update form data or LaTeX source" },
  { method: "POST", path: "/resumes/:id/fork", description: "Duplicate a resume" },
  { method: "DELETE", path: "/resumes/:id", description: "Delete a resume" },
  { method: "POST", path: "/resumes/:id/compile", description: "Compile LaTeX, returns application/pdf" },
];

const sandboxRules = [
  "Isolated container on an internal-only network — no route to the internet",
  "pdflatex runs with -no-shell-escape, so \\write18 cannot execute commands",
  "Hard 10 second timeout per compile",
  "Memory and CPU limits enforced at the container level",
  "Read-only filesystem except a throwaway /tmp scratch directory",
  "Runs as a non-root user and is reachable only from the backend",
];

const stack = [
  { name: "Next.js 14", role: "Frontend" },
  { name: "Express + TypeScript", role: "REST API" },
  { name: "PostgreSQL 16", role: "Data (JSONB resume data)" },
  { name: "TeX Live pdflatex", role: "Compiler" },
  { name: "Docker Compose", role: "Local environment" },
];

const methodColors: Record<string, string> = {
  GET: "text-emerald-300",
  POST: "text-[#A369FF]",
  PATCH: "text-amber-300",
  DELETE: "text-red-300",
};

const templateExample = `\\section{Experience}
  \\resumeSubHeadingListStart
{{EXPERIENCE}}
  \\resumeSubHeadingListEnd

\\section{Technical Skills}
  \\begin{itemize}[leftmargin=*]
{{SKILLS}}
  \\end{itemize}`;

const curlExample = `curl -X POST http://localhost:4000/api/resumes/$ID/compile \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"latex_source": "\\\\documentclass{article}..."}' \\
  -o resume.pdf`;

export default function DevelopersPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="Developers"
        title="LaTeX under the hood, yours to control"
        description="Every ResumeX resume is real, editable LaTeX. Here is how templates, the API and the compiler fit together."
      />

      {/* Templates */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              Template placeholders
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
              Templates are plain .tex files. Placeholders are swapped for your
              data with LaTeX special characters escaped.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full border border-white/15 rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-white/15 bg-white/5 text-sm text-white/70">
                  template.tex
                </div>
                <pre className="p-4 md:p-6 text-sm font-mono text-white/80 overflow-x-auto">
                  {templateExample}
                </pre>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border border-white/15 rounded-xl divide-y divide-white/10">
                {placeholders.map((placeholder) => (
                  <div
                    key={placeholder.token}
                    className="flex justify-between gap-4 px-4 py-2.5 text-sm"
                  >
                    <code className="font-mono text-[#A369FF]">
                      {placeholder.token}
                    </code>
                    <span className="text-white/70 text-right">
                      {placeholder.description}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* API */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              REST API
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
              JSON over HTTP. Authenticate with{" "}
              <code className="font-mono text-white">Authorization: Bearer &lt;JWT&gt;</code>{" "}
              on everything except /auth.
            </p>
          </Reveal>
          <Reveal className="mt-10">
            <div className="border border-white/15 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-white/15 bg-white/5 text-sm text-white/70 font-mono">
                Base URL /api
              </div>
              <div className="divide-y divide-white/10">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.method + endpoint.path}
                    className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_260px_1fr] gap-x-4 gap-y-1 px-4 py-3 text-sm"
                  >
                    <span
                      className={`font-mono font-semibold ${methodColors[endpoint.method]}`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="font-mono break-all">{endpoint.path}</code>
                    <span className="text-white/70 col-start-2 md:col-start-auto">
                      {endpoint.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="mt-5">
            <div className="border border-white/15 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-white/15 bg-white/5 text-sm text-white/70">
                Compile a resume
              </div>
              <pre className="p-4 md:p-6 text-sm font-mono text-white/80 overflow-x-auto">
                {curlExample}
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sandbox + stack */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              Secure by default
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
              Compiling user-supplied LaTeX is risky, so the compiler is locked
              down.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full border border-white/15 p-6 md:p-8 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)]">
                <div className="text-xl font-medium tracking-tight">
                  Compiler sandbox
                </div>
                <ul className="mt-5 space-y-3">
                  {sandboxRules.map((rule) => (
                    <li key={rule} className="flex gap-3 text-white/70">
                      <span className="text-[#A369FF]">✓</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full border border-white/15 p-6 md:p-8 rounded-xl">
                <div className="text-xl font-medium tracking-tight">Stack</div>
                <div className="mt-5 grid gap-3">
                  {stack.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center border border-white/15 rounded-lg px-4 py-3"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-white/50 text-sm">{item.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CallToAction />
      <Footer />
    </>
  );
}
