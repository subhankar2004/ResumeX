"use client";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

// A scripted exchange showing how Rex turns a casual answer into an ATS-ready bullet
const conversation = [
  { from: "rex", text: "Hey! What role are you going for? 🎯" },
  { from: "you", text: "Backend engineer. I built a payment retry service at my job" },
  { from: "rex", text: "Nice! Any numbers on how much it recovered?" },
  { from: "you", text: "around 12% of failed payments, written in Go" },
];

const polishedBullet =
  "Recovered 12% of failed card payments by building a retry service with smart backoff in Go";

const benefits = [
  {
    title: "Asks like a friend",
    description: "One casual question at a time, tuned to your field and your template.",
  },
  {
    title: "Writes like a pro",
    description: "Impact-first bullets, a sharp summary and the keywords recruiters search for.",
  },
  {
    title: "Never makes things up",
    description: "Every number and fact on your resume comes from you. Rex checks it.",
  },
  {
    title: "Tailors to the job",
    description: "Paste a job post and Rex mirrors its keywords where your experience backs them.",
  },
];

const Avatar = () => (
  <div className="h-8 w-8 flex-none rounded-full inline-flex items-center justify-center text-xs font-semibold bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] border border-white/15">
    R
  </div>
);

export const MeetRex = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">Meet Rex</h2>
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
          Your AI resume writer. Chat for a few minutes and get an ATS-ready resume written the way
          top candidates write theirs.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 items-center">
          {/* Chat preview */}
          <div className="border border-white/15 rounded-xl p-5 md:p-6 bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.25),black)]">
            <div className="space-y-3">
              {conversation.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.5, duration: 0.4 }}
                  className={twMerge("flex gap-2.5 max-w-[90%]", message.from === "you" && "ml-auto flex-row-reverse")}
                >
                  {message.from === "rex" && <Avatar />}
                  <div
                    className={twMerge(
                      "px-4 py-2 rounded-2xl text-sm",
                      message.from === "rex"
                        ? "bg-white/5 border border-white/15 rounded-tl-sm"
                        : "bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_rgb(140,69,255,.4)] rounded-tr-sm"
                    )}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: conversation.length * 0.5 + 0.3, duration: 0.5 }}
              className="mt-5 border border-[#A369FF]/50 rounded-lg p-4 bg-black/60"
            >
              <div className="text-xs text-[#A369FF] font-medium">On your resume</div>
              <div className="mt-1.5 text-sm">• {polishedBullet}</div>
            </motion.div>
          </div>

          {/* Benefits */}
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="border border-white/15 rounded-xl p-5">
                  <div className="font-medium">{benefit.title}</div>
                  <p className="text-white/70 text-sm mt-1.5">{benefit.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a href={user ? "/create" : "/signup"}>
                <Button>Start with Rex</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
