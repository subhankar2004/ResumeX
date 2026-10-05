"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { api } from "@/lib/api";
import { ResumeTemplate, SECTION_LABELS, isSectionComplete } from "@/lib/templates";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface InterviewState {
  messages: ChatMessage[];
  formData: any;
  done: boolean;
  title: string;
  jobDescription?: string;
}

export interface BuildOptions {
  polish: boolean; // run Rex Writer before saving
}

// Backend accepts up to 120 messages per interview
const MESSAGE_LIMIT = 120;

export const emptyFormData = (email: string) => ({
  personal: { name: "", email, phone: "" },
  education: [],
  experience: [],
  skills: [],
  projects: [],
});

// A new resume's chat lives in this browser tab until it is built (then it is saved with the resume)
const storageKey = (templateId: string) => `resumex:interview:${templateId}`;

export const loadSessionInterview = (templateId: string): InterviewState | null => {
  try {
    const saved = sessionStorage.getItem(storageKey(templateId));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveSessionInterview = (templateId: string, state: InterviewState) => {
  try {
    sessionStorage.setItem(storageKey(templateId), JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode); the conversation just won't survive a refresh
  }
};

export const clearInterview = (templateId: string) => {
  try {
    sessionStorage.removeItem(storageKey(templateId));
  } catch {
    // Storage unavailable; nothing to clear
  }
};

const RexAvatar = () => (
  <div className="h-9 w-9 flex-none rounded-full inline-flex items-center justify-center text-sm font-semibold bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] border border-white/15">
    R
  </div>
);

// Chat with Rex, the AI interviewer, who collects the data the chosen template needs.
// The parent supplies the starting state and persists it via onStateChange.
export const ResumeInterview = (props: {
  template: ResumeTemplate;
  initialState: InterviewState;
  onStateChange?: (state: InterviewState) => void;
  building: boolean;
  buildingLabel?: string;
  buildLabel: string;
  onBuild: (state: InterviewState, options: BuildOptions) => void;
}) => {
  const { template } = props;
  const [messages, setMessages] = useState<ChatMessage[]>(props.initialState.messages);
  const [formData, setFormData] = useState<any>(props.initialState.formData);
  const [done, setDone] = useState(props.initialState.done);
  const [title, setTitle] = useState(props.initialState.title);
  const [jobDescription, setJobDescription] = useState(props.initialState.jobDescription || "");
  const [showJobDescription, setShowJobDescription] = useState(Boolean(props.initialState.jobDescription));
  const [polish, setPolish] = useState(true);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);
  const initialState = useRef(props.initialState);
  const onStateChange = useRef(props.onStateChange);
  onStateChange.current = props.onStateChange;
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = async (history: ChatMessage[], currentData = formData) => {
    setThinking(true);
    setError("");
    try {
      const turn = await api.interview({
        template_id: template.id,
        messages: history,
        form_data: currentData,
      });
      setMessages([...history, { role: "assistant", content: turn.reply }]);
      setFormData(turn.form_data);
      setDone(turn.done);
    } catch (err: any) {
      setError(err.message || "Rex lost the thread. Please try again.");
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  // Continue an existing conversation, or have Rex open a new one
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialState.current.messages.length === 0) {
      send([], initialState.current.formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onStateChange.current?.({ messages, formData, done, title, jobDescription });
  }, [messages, formData, done, title, jobDescription]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, error]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = input.trim();
    if (!content || thinking) return;
    setInput("");
    send([...messages, { role: "user", content }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Back to how this chat started (empty for a new resume, the resume's data for an existing one)
  const handleRestart = () => {
    if (!confirm("Start the conversation over? Anything collected in this chat will be cleared.")) return;
    const fresh = initialState.current.formData;
    setMessages([]);
    setFormData(fresh);
    setDone(false);
    send([], fresh);
  };

  const completed = template.sections.filter((s) => isSectionComplete(s, formData)).length;
  const canBuild = isSectionComplete("personal", formData) && !thinking;
  const atLimit = messages.length >= MESSAGE_LIMIT - 1;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-5 h-full min-h-0">
      {/* Chat */}
      <div className="border border-white/15 rounded-xl flex flex-col min-h-[70vh] lg:min-h-0 bg-white/[0.02]">
        <div className="px-5 py-3 border-b border-white/15 flex items-center gap-3">
          <RexAvatar />
          <div>
            <div className="font-medium">Rex</div>
            <div className="text-xs text-white/50">
              {thinking ? "typing..." : "Your resume buddy"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            disabled={thinking}
            className="ml-auto text-xs text-white/50 hover:text-white transition disabled:opacity-50"
          >
            Start over
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={twMerge(
                  "flex gap-3 max-w-[85%]",
                  message.role === "user" && "ml-auto flex-row-reverse"
                )}
              >
                {message.role === "assistant" && <RexAvatar />}
                <div
                  className={twMerge(
                    "px-4 py-2.5 rounded-2xl whitespace-pre-wrap leading-relaxed",
                    message.role === "assistant"
                      ? "bg-white/5 border border-white/15 rounded-tl-sm"
                      : "bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_rgb(140,69,255,.4)] rounded-tr-sm"
                  )}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <div className="flex gap-3">
              <RexAvatar />
              <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-white/5 border border-white/15 flex gap-1.5">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-2 w-2 rounded-full bg-[#A369FF]"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => send(messages)}
                className="flex-none px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition text-white"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-white/15">
          {atLimit ? (
            <div className="text-sm text-white/60 text-center py-2">
              That&apos;s a lot of great detail! Build your resume now and fine-tune it in the editor.
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={2000}
                placeholder={done ? "Anything else to add or change?" : "Type your answer..."}
                className="flex-1 resize-none max-h-40 px-4 py-3 rounded-lg bg-black border border-white/15 focus:border-[#8c45ff] focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="px-5 py-3 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Collected so far */}
      <aside className="border border-white/15 rounded-xl p-5 flex flex-col gap-5 lg:overflow-y-auto bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.2),black)]">
        <div>
          <div className="flex justify-between items-baseline">
            <h2 className="font-semibold">Your resume so far</h2>
            <span className="text-sm text-white/50">
              {completed}/{template.sections.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-[#A369FF] rounded-full"
              animate={{ width: `${(completed / template.sections.length) * 100}%` }}
            />
          </div>
        </div>

        <ul className="space-y-2">
          {template.sections.map((section) => {
            const complete = isSectionComplete(section, formData);
            return (
              <li key={section} className="flex items-center gap-2.5 text-sm">
                <span
                  className={twMerge(
                    "h-5 w-5 flex-none rounded-full border inline-flex items-center justify-center text-xs",
                    complete ? "border-[#A369FF] bg-[#A369FF] text-black" : "border-white/20 text-transparent"
                  )}
                >
                  ✓
                </span>
                <span className={complete ? "text-white" : "text-white/50"}>
                  {SECTION_LABELS[section]}
                </span>
              </li>
            );
          })}
        </ul>

        <CollectedPreview formData={formData} />

        <div className="mt-auto space-y-3 pt-2">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Resume title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 focus:border-[#8c45ff] focus:outline-none text-sm"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowJobDescription(!showJobDescription)}
              className="text-xs text-[#A369FF] hover:text-white transition"
            >
              {showJobDescription ? "− " : "+ "}Tailor to a job post (optional)
            </button>
            {showJobDescription && (
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                maxLength={8000}
                rows={4}
                placeholder="Paste the job description. Rex Writer will mirror its keywords where your experience backs them up."
                className="mt-2 w-full px-3 py-2 rounded-lg bg-black border border-white/15 focus:border-[#8c45ff] focus:outline-none text-xs resize-none"
              />
            )}
          </div>
          <label className="flex items-start gap-2 text-xs text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={polish}
              onChange={(e) => setPolish(e.target.checked)}
              className="mt-0.5 accent-[#8c45ff]"
            />
            <span>
              Polish with Rex Writer: ATS keywords, impact-first bullets and a summary, using only
              facts you gave (recommended)
            </span>
          </label>
          <button
            type="button"
            onClick={() =>
              props.onBuild(
                { messages, formData, done, title: title.trim() || "My Resume", jobDescription },
                { polish }
              )
            }
            disabled={!canBuild || props.building}
            className="w-full py-3 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition disabled:opacity-50"
          >
            {props.building ? props.buildingLabel || "Saving..." : props.buildLabel}
          </button>
          <p className="text-xs text-white/50 text-center">
            {canBuild
              ? done
                ? "Rex has everything. You can edit every line in the editor next."
                : "You can save now and fill gaps in the editor, or keep chatting."
              : "Tell Rex your name to continue."}
          </p>
        </div>
      </aside>
    </div>
  );
};

// Compact read-out of the data Rex has collected
const CollectedPreview = ({ formData }: { formData: any }) => {
  const personal = formData?.personal || {};
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).join(" · ");
  const roles = (formData?.experience || []).map((e: any) => [e.role, e.company].filter(Boolean).join(" @ "));
  const schools = (formData?.education || []).map((e: any) => e.institution || e.degree);
  const projects = (formData?.projects || []).map((p: any) => p.name);
  const skills = (formData?.skills || []).flatMap((s: any) => s.items || []).slice(0, 12);
  const summary = formData?.summary || formData?.objective || formData?.about;

  if (!personal.name && !roles.length && !schools.length && !projects.length && !skills.length) {
    return null;
  }

  return (
    <div className="border-t border-white/10 pt-5 space-y-3 text-sm">
      {formData?.target_role && (
        <div className="text-xs">
          <span className="text-white/50">Target role: </span>
          <span className="text-[#A369FF]">{formData.target_role}</span>
        </div>
      )}
      {personal.name && (
        <div>
          <div className="font-medium text-base">{personal.name}</div>
          {contact && <div className="text-white/50 text-xs mt-0.5 break-all">{contact}</div>}
        </div>
      )}
      {summary && <p className="text-white/70 text-xs leading-relaxed line-clamp-4">{summary}</p>}
      {[
        ["Experience", roles],
        ["Education", schools],
        ["Projects", projects],
      ].map(([label, items]) =>
        (items as string[]).length ? (
          <div key={label as string}>
            <div className="text-xs text-white/50">{label}</div>
            <ul className="mt-1 space-y-0.5">
              {(items as string[]).map((item, i) => (
                <li key={i} className="text-white/80 truncate">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill: string) => (
            <span key={skill} className="text-xs border border-white/15 rounded-full px-2 py-0.5 text-white/70">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
