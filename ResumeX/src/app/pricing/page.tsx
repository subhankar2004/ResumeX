import type { Metadata } from "next";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { CallToAction } from "@/sections/CallToAction";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Faq } from "@/components/Faq";

export const metadata: Metadata = {
  title: "Pricing — ResumeX AI",
  description:
    "Start free with two resumes. Upgrade to Pro for unlimited resumes, the full template library and AI tools.",
};

// TODO: placeholder until Stripe billing is set up — update in one place.
const PRO_MONTHLY_PRICE = "$5";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to build your first resume.",
    features: [
      "2 resumes",
      "Core template library",
      "AI interview with Rex",
      "LaTeX code editor",
      "Unlimited PDF compiles & downloads",
    ],
    cta: { label: "Get started", href: "/signup" },
    highlighted: false,
  },
  {
    name: "Pro",
    price: PRO_MONTHLY_PRICE,
    period: "per month",
    description: "For active job seekers tailoring every application.",
    features: [
      "Unlimited resumes & forks",
      "Full template library incl. premium designs",
      "AI writing assistant",
      "ATS score checker",
      "Cover letter generator",
    ],
    cta: null,
    highlighted: true,
  },
];

const comparison = [
  { feature: "Resumes", free: "2", pro: "Unlimited" },
  { feature: "Templates", free: "Core", pro: "All" },
  { feature: "LaTeX editor & PDF compile", free: "✓", pro: "✓" },
  { feature: "Fork for each application", free: "—", pro: "✓" },
  { feature: "AI interview with Rex", free: "✓", pro: "✓" },
  { feature: "AI writing assistant", free: "—", pro: "✓" },
  { feature: "ATS score checker", free: "—", pro: "✓" },
  { feature: "Cover letter generator", free: "—", pro: "✓" },
];

const faqs = [
  {
    question: "Do I need to know LaTeX?",
    answer:
      "No. You fill in a guided form and ResumeX generates the LaTeX for you. The code editor is there if you want to fine-tune things, but you never have to touch it.",
  },
  {
    question: "Is the free plan really free?",
    answer:
      "Yes. You get two resumes with the core templates, Rex, the editor and unlimited PDF downloads, with no credit card required.",
  },
  {
    question: "When will Pro be available?",
    answer:
      "Pro and its AI features are in development. Create a free account now and you will be able to upgrade as soon as it launches.",
  },
  {
    question: "Will my resume pass applicant tracking systems?",
    answer:
      "Our templates use a clean structure with real, selectable text and no tables or images in the body, which is what ATS parsers read best.",
  },
  {
    question: "Can I export the LaTeX source?",
    answer:
      "Your .tex source is always visible in the editor, so you can copy it into Overleaf or your own setup at any time.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="Pricing"
        title="Simple pricing, start for free"
        description="Build your first resume at no cost. Upgrade when you are ready to tailor one for every application."
      />

      {/* Plans */}
      <section className="py-20 md:py-24">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 0.1}>
                <div
                  className={twMerge(
                    "h-full flex flex-col border border-white/15 p-6 md:p-10 rounded-xl",
                    plan.highlighted &&
                      "border-[#A369FF]/60 bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)] shadow-[0_0_40px_rgb(140,69,255,.25)]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-xl font-medium">{plan.name}</div>
                    {plan.highlighted && (
                      <div className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
                        Coming soon
                      </div>
                    )}
                  </div>
                  <p className="text-white/70 mt-2">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-6xl font-medium tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-white/50">{plan.period}</span>
                  </div>
                  <ul className="mt-8 space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-white/80">
                        <span className="text-[#A369FF]">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.cta ? (
                    <Link
                      href={plan.cta.href}
                      className="mt-10 text-center py-3 px-6 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition"
                    >
                      {plan.cta.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-10 py-3 px-6 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] opacity-70 cursor-not-allowed"
                    >
                      Coming soon
                    </button>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              Compare plans
            </h2>
          </Reveal>
          <Reveal className="mt-10">
            <div className="border border-white/15 rounded-xl overflow-hidden max-w-4xl mx-auto">
              <div className="grid grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_140px_140px] px-4 md:px-6 py-3 bg-white/5 border-b border-white/15 text-sm font-medium">
                <span>Feature</span>
                <span className="text-center">Free</span>
                <span className="text-center text-[#A369FF]">Pro</span>
              </div>
              <div className="divide-y divide-white/10">
                {comparison.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_140px_140px] px-4 md:px-6 py-3 text-sm"
                  >
                    <span className="text-white/80">{row.feature}</span>
                    <span className="text-center text-white/70">{row.free}</span>
                    <span className="text-center">{row.pro}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
              Questions & answers
            </h2>
          </Reveal>
          <Reveal className="mt-10">
            <Faq items={faqs} />
          </Reveal>
        </div>
      </section>

      <CallToAction />
      <Footer />
    </>
  );
}
