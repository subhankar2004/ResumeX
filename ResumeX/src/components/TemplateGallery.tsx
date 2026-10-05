"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { twMerge } from "tailwind-merge";
import { ResumeTemplate, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplatePreviewModal } from "@/components/TemplatePreviewModal";

// Grid of every template; `action` renders the preview modal's main button for the chosen one
export const TemplateGallery = (props: {
  action: (template: ResumeTemplate) => React.ReactNode;
}) => {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState<ResumeTemplate | null>(null);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    api
      .getTemplates(true)
      .then(setTemplates)
      .catch(() => setError("Couldn't load templates. Please refresh to try again."))
      .finally(() => setLoading(false));
  }, []);

  const closePreview = useCallback(() => setPreviewing(null), []);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-white/15 rounded-xl p-2.5 animate-pulse">
            <div className="aspect-[8.5/11] rounded-lg bg-white/5"></div>
            <div className="h-4 w-1/2 bg-white/10 rounded mt-4 mx-1.5"></div>
            <div className="h-3 w-3/4 bg-white/5 rounded mt-2 mx-1.5 mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-white/70 py-12">{error}</div>;
  }

  const activeTags = TEMPLATE_CATEGORIES.find((c) => c.key === category)?.tags || [];
  const visible = activeTags.length
    ? templates.filter((t) => t.tags.some((tag) => activeTags.includes(tag)))
    : templates;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={twMerge(
              "text-sm rounded-full px-4 py-1.5 border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition",
              category === c.key && "border-[#A369FF] text-white bg-[#8c45ff]/15"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((template) => (
          <TemplateCard key={template.id} template={template} onSelect={setPreviewing} />
        ))}
      </div>
      <TemplatePreviewModal
        template={previewing}
        onClose={closePreview}
        action={previewing ? props.action(previewing) : null}
      />
    </>
  );
};
