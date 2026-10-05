"use client";
import { ATS_SCORE_NOTE, ResumeTemplate, SECTION_LABELS, previewImage } from "@/lib/templates";

export const AtsBadge = ({ score }: { score: number }) => (
  <span
    title={ATS_SCORE_NOTE}
    className={`text-xs rounded-full px-2 py-0.5 font-semibold border ${
      score >= 95
        ? "border-emerald-400/50 text-emerald-300 bg-emerald-400/10"
        : "border-white/20 text-white/70 bg-white/5"
    }`}
  >
    ATS {score}
  </span>
);

// Preview thumbnail + name; clicking opens the full preview
export const TemplateCard = (props: {
  template: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
}) => {
  const { template } = props;

  return (
    <button
      type="button"
      onClick={() => props.onSelect(template)}
      className="group h-full flex flex-col text-left border border-white/15 rounded-xl p-2.5 hover:border-[#A369FF]/60 hover:shadow-[0_0_30px_rgb(140,69,255,.25)] transition"
    >
      <div className="relative aspect-[8.5/11] overflow-hidden rounded-lg border border-white/10 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewImage(template)}
          alt={`${template.name} template preview`}
          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
          loading="lazy"
        />
        {template.is_pro_only && (
          <div className="absolute top-2.5 right-2.5 text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
            Pro
          </div>
        )}
      </div>
      <div className="px-1.5 pt-4 pb-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium">{template.name}</div>
          <AtsBadge score={template.ats_score} />
        </div>
        <p className="text-sm text-white/60 mt-1 line-clamp-2">{template.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.sections
            .filter((section) => section !== "personal")
            .slice(0, 4)
            .map((section) => (
              <span
                key={section}
                className="text-xs border border-white/15 rounded-full px-2 py-0.5 text-white/60"
              >
                {SECTION_LABELS[section]}
              </span>
            ))}
        </div>
      </div>
    </button>
  );
};
