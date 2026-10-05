import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates — ResumeX AI",
  description:
    "Browse ResumeX's LaTeX resume templates with real sample previews, then build yours with an AI interviewer.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
