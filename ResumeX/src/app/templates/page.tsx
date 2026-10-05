"use client";

import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { CallToAction } from "@/sections/CallToAction";
import { PageHero } from "@/components/PageHero";
import { TemplateGallery } from "@/components/TemplateGallery";
import { UseTemplateButton } from "@/components/UseTemplateButton";

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="Templates"
        title="Pick a look, we'll handle the LaTeX"
        description="Every template below is a real compiled resume. Choose one and Rex, your AI resume buddy, will fill it in with you."
      />
      <section className="py-20 md:py-24">
        <div className="container">
          <TemplateGallery action={(template) => <UseTemplateButton template={template} />} />
        </div>
      </section>
      <CallToAction />
      <Footer />
    </>
  );
}
