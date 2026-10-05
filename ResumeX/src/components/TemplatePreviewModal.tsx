"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ATS_SCORE_NOTE, ResumeTemplate, SECTION_LABELS, previewImage, previewPdf } from "@/lib/templates";
import { AtsBadge } from "@/components/TemplateCard";

// Full-size template preview with the primary action supplied by the page
export const TemplatePreviewModal = (props: {
  template: ResumeTemplate | null;
  onClose: () => void;
  action: React.ReactNode;
}) => {
  const { template, onClose } = props;

  useEffect(() => {
    if (!template) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [template, onClose]);

  return (
    <AnimatePresence>
      {template && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] overflow-auto border border-white/15 rounded-xl bg-black grid md:grid-cols-[1fr_320px]"
          >
            <div className="p-4 md:p-6 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage(template)}
                alt={`${template.name} template preview`}
                className="w-full rounded-lg border border-white/10 bg-white"
              />
            </div>
            <div className="p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-medium tracking-tight">{template.name}</h2>
                  {template.is_pro_only && (
                    <span className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
                      Pro
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview"
                  className="text-white/50 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-white/70 mt-3">{template.description}</p>

              <div className="mt-5 border border-white/15 rounded-lg p-3">
                <AtsBadge score={template.ats_score} />
                <p className="text-xs text-white/50 mt-2 leading-relaxed">{ATS_SCORE_NOTE}</p>
              </div>

              <div className="mt-6 text-sm font-medium">Sections</div>
              <ul className="mt-2 space-y-1.5">
                {template.sections.map((section) => (
                  <li key={section} className="flex gap-2.5 text-white/70 text-sm">
                    <span className="text-[#A369FF]">✓</span>
                    {SECTION_LABELS[section]}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8 space-y-3">
                {props.action}
                <a
                  href={previewPdf(template)}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center py-2.5 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition"
                >
                  Open sample PDF
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
