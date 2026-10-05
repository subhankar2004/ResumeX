import type { Metadata } from "next";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { CallToAction } from "@/sections/CallToAction";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Features — ResumeX AI",
  description:
    "Guided forms, curated LaTeX templates, a live code editor and sandboxed PDF compilation — everything ResumeX does to build an ATS-friendly resume.",
};

const steps = [
  {
    title: "Tell us who you are",
    description:
      "Pick your profile — Fresher, Experienced, Tech or Non-Tech — so every suggestion fits your career stage.",
  },
  {
    title: "Chat with Rex",
    description:
      "Rex asks about your education, experience, skills and projects one friendly question at a time.",
  },
  {
    title: "Choose a template",
    description:
      "Browse real previews of hand-curated LaTeX templates built to be parsed cleanly by applicant tracking systems.",
  },
  {
    title: "Get real LaTeX, instantly",
    description:
      "Your answers are typeset into the template automatically — special characters escaped, sections laid out.",
  },
  {
    title: "Fine-tune in the editor",
    description:
      "Edit the source on the left, hit Compile, and watch the PDF refresh on the right — Overleaf-style.",
  },
  {
    title: "Download and iterate",
    description:
      "Grab the PDF, then fork the resume to tailor a version for every application from your dashboard.",
  },
];

const features = [
  {
    icon: "◆",
    title: "Chat with Rex",
    description:
      "Rex, your AI resume buddy, interviews you like a friend over coffee and turns your answers into polished bullet points.",
  },
  {
    icon: "▤",
    title: "Curated LaTeX templates",
    description:
      "Minimal Tech, Experienced Professional, Fresh Graduate, Career Changer and Creative layouts, each tuned for a persona.",
  },
  {
    icon: "</>",
    title: "Two-panel code editor",
    description:
      "Full control over the generated .tex source, with the rendered PDF side by side.",
  },
  {
    icon: "⚡",
    title: "Sandboxed compilation",
    description:
      "Every compile runs in an isolated container with no network, no shell-escape and a hard time limit.",
  },
  {
    icon: "⑂",
    title: "Fork & version",
    description:
      "Duplicate a resume in one click to keep a separate version for each role you apply to.",
  },
  {
    icon: "✓",
    title: "ATS-friendly by design",
    description:
      "Clean single-column structure and real text — no tables or images that trip up parsers.",
  },
];

const comingSoon = [
  {
    title: "AI template suggester",
    description:
      "Recommendations ranked by your profile type and how much content you have.",
  },
  {
    title: "Writing assistant",
    description:
      "Highlight a bullet point to rephrase it, tighten it or add measurable impact.",
  },
  {
    title: "ATS score checker",
    description:
      "Paste a job description to see your match score and the keywords you are missing.",
  },
  {
    title: "Cover letter generator",
    description: "A tailored cover letter drafted from your resume and the job post.",
  },
  {
    title: "Shareable resume links",
    description: "A public URL for your latest resume, always up to date.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="Features"
        title="Everything you need to ship a standout resume"
        description="From the first question to a typeset PDF, ResumeX handles the LaTeX so you can focus on your story."
      />

      {/* How it works */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              How it works
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
              Six steps from a blank page to a polished PDF.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.05}>
                <div className="h-full border border-white/15 rounded-xl p-6 relative overflow-hidden">
                  <div className="text-6xl font-semibold tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgb(163,105,255),transparent)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="font-medium text-lg mt-2">{step.title}</div>
                  <p className="text-white/70 mt-2 text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              Built for great resumes
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
              The typesetting quality of LaTeX without the learning curve.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.05}>
                <div className="h-full border border-white/15 p-6 md:p-8 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)]">
                  <div className="h-12 w-12 border border-white/15 rounded-lg inline-flex items-center justify-center text-[#A369FF] font-semibold">
                    {feature.icon}
                  </div>
                  <div className="text-xl font-medium tracking-tight mt-5">
                    {feature.title}
                  </div>
                  <p className="text-white/70 mt-2">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              On the roadmap
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
              AI-powered features coming to ResumeX Pro.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {comingSoon.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05}>
                <div className="h-full border border-white/15 border-dashed rounded-xl p-6">
                  <div className="flex items-center gap-2.5">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
                      Soon
                    </div>
                  </div>
                  <p className="text-white/70 mt-2 text-sm md:text-base">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
      <Footer />
    </>
  );
}
