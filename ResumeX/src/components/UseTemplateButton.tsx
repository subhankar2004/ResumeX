"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ResumeTemplate } from "@/lib/templates";

const primaryClass =
  "block text-center py-3 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition";

// Main action for a template: start the AI interview, or explain what's needed first
export const UseTemplateButton = (props: {
  template: ResumeTemplate;
  onUse?: (template: ResumeTemplate) => void;
}) => {
  const { user } = useAuth();
  const { template } = props;

  if (!user) {
    return (
      <Link href="/signup" className={primaryClass}>
        Sign up to use this template
      </Link>
    );
  }

  if (template.is_pro_only && user.plan !== "pro") {
    return (
      <Link href="/pricing" className={primaryClass}>
        Available on Pro
      </Link>
    );
  }

  if (props.onUse) {
    return (
      <button type="button" onClick={() => props.onUse?.(template)} className={`w-full ${primaryClass}`}>
        Use this template
      </button>
    );
  }

  return (
    <Link href={`/create?template=${template.id}`} className={primaryClass}>
      Use this template
    </Link>
  );
};
