import type { Metadata } from "next";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { CallToAction } from "@/sections/CallToAction";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Changelog — ResumeX AI",
  description: "New features, improvements and fixes shipped to ResumeX.",
};

const releases = [
  {
    version: "v0.7",
    date: "October 2026",
    title: "Rex Writer and ATS-optimized templates",
    tag: "New",
    changes: [
      "Rex Writer polishes your answers into impact-first bullets, a summary and ATS keywords, using only facts you gave",
      "Tailor a resume to a job post by pasting its description",
      "Six new ATS-optimized templates: Software Engineer, Data Scientist, Business Professional, Graduate, Modern Sans and Executive",
      "ATS ratings and field filters in the template gallery",
      "Rex's chat is saved with each resume, so you can come back and keep adding to it",
      "Free plan now includes 2 resumes",
    ],
  },
  {
    version: "v0.6",
    date: "October 2026",
    title: "Meet Rex, your AI resume buddy",
    tag: "New",
    changes: [
      "Chat with Rex to build your resume: he asks only what your template needs",
      "Template gallery with real previews of every design",
      "Sign in with Google or GitHub",
      "Profile menu and a new Profile page",
    ],
  },
  {
    version: "v0.5",
    date: "October 2026",
    title: "A proper home for every page",
    tag: "Improvement",
    changes: [
      "New Features, Developers, Pricing and Changelog pages",
      "Navigation now works on mobile with a slide-down menu",
      "More reliable local development environment",
    ],
  },
  {
    version: "v0.4",
    date: "July 2026",
    title: "The resume builder is live",
    tag: "New",
    changes: [
      "Sign up and log in with email and password",
      "Create a resume from a template with your details filled in",
      "Two-panel editor: LaTeX source on the left, PDF preview on the right",
      "Secure, sandboxed PDF compilation",
      "Dashboard to view and delete your resumes",
      "Five LaTeX templates: Minimal Tech, Experienced Professional, Fresh Graduate, Career Changer and Creative",
    ],
  },
  {
    version: "v0.3",
    date: "November 2025",
    title: "Testimonials refresh",
    tag: "Improvement",
    changes: ["Updated the testimonials on the home page"],
  },
  {
    version: "v0.2",
    date: "September 2025",
    title: "Motion everywhere",
    tag: "Improvement",
    changes: [
      "Animated hero with an orbiting planet and parallax star field",
      "Interactive feature tabs and call-to-action spotlight",
      "Scrolling logo ticker and testimonials",
    ],
  },
  {
    version: "v0.1",
    date: "August 2025",
    title: "Hello, ResumeX",
    tag: "New",
    changes: ["First version of the ResumeX landing page"],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="Changelog"
        title="What's new in ResumeX"
        description="Every feature, improvement and fix we ship, newest first."
      />

      <section className="py-20 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto relative">
            {/* Timeline rail */}
            <div className="absolute left-[7px] md:left-[167px] top-2 bottom-2 w-px bg-[linear-gradient(to_bottom,rgb(163,105,255),rgba(255,255,255,.15)_30%,transparent)]"></div>

            <div className="space-y-12">
              {releases.map((release) => (
                <Reveal key={release.version}>
                  <div className="relative grid md:grid-cols-[140px_1fr] gap-3 md:gap-12 pl-8 md:pl-0">
                    <div className="md:text-right md:pt-1">
                      <div className="font-medium">{release.version}</div>
                      <div className="text-white/50 text-sm">{release.date}</div>
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-[160px] top-1.5 h-4 w-4 border border-white rounded-full inline-flex items-center justify-center bg-black">
                      <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                    </div>

                    <div className="border border-white/15 p-6 md:p-8 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="text-xl md:text-2xl font-medium tracking-tight">
                          {release.title}
                        </div>
                        <div className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
                          {release.tag}
                        </div>
                      </div>
                      <ul className="mt-5 space-y-2">
                        {release.changes.map((change) => (
                          <li key={change} className="flex gap-3 text-white/70">
                            <span className="text-[#A369FF]">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CallToAction />
      <Footer />
    </>
  );
}
