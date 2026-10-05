"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Faq = (props: {
  items: { question: string; answer: string }[];
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border border-white/15 rounded-xl divide-y divide-white/10 max-w-3xl mx-auto">
      {props.items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left font-medium"
            >
              <span>{item.question}</span>
              <span
                className={twMerge(
                  "text-[#A369FF] text-xl transition-transform",
                  isOpen && "rotate-45"
                )}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-white/70">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
