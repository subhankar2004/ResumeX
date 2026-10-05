"use client";
import { motion } from "framer-motion";

// Fades content up into view on scroll; lets server-rendered pages share the landing animations.
export const Reveal = (
  props: React.PropsWithChildren<{ className?: string; delay?: number }>
) => {
  return (
    <motion.div
      className={props.className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: props.delay ?? 0 }}
    >
      {props.children}
    </motion.div>
  );
};
