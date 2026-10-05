"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import starBg from "@/assets/stars.png";
import { useRef } from "react";

// Compact version of the landing Hero (star field + purple glow + arc) for inner pages.
export const PageHero = (props: {
  eyebrow: string;
  title: string;
  description: string;
}) => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(
    scrollYProgress,
    [0, 1],
    [-300, 300]
  );

  return (
    <section
      ref={sectionRef}
      className="h-[420px] md:h-[520px] flex items-center overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)]"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${starBg.src})`,
          backgroundPositionY,
        }}
        animate={{
          backgroundPositionX: starBg.width,
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_center_bottom,rgb(140,69,255,.5),rgb(14,0,36,.5)_78%,transparent)]"></div>

      {/* Planet horizon */}
      <div className="absolute h-[600px] w-[1200px] left-1/2 -translate-x-1/2 top-[85%] rounded-full border border-white/20 bg-[radial-gradient(50%_50%_at_50%_0%,rgb(184,148,255),rgb(24,0,66)_60%)] shadow-[0_-20px_80px_rgb(140,69,255,.6)]"></div>

      {/* Orbit ring */}
      <motion.div
        style={{
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          rotate: "1turn",
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[700px] w-[700px] md:h-[900px] md:w-[900px] rounded-full border border-white opacity-20 top-full left-1/2"
      >
        <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-2 w-2 left-1/2 bg-white rounded-full top-0 -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>

      <div className="container relative z-10 -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex justify-center">
            <div className="border border-white/15 rounded-full px-3 py-1 text-xs md:text-sm text-white/70 backdrop-blur bg-white/5">
              {props.eyebrow}
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl md:leading-none font-semibold tracking-tighter bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,138,.5))] text-transparent bg-clip-text text-center mt-5 max-w-3xl mx-auto">
            {props.title}
          </h1>
          <p className="text-lg md:text-xl text-white/70 mt-5 text-center max-w-xl mx-auto tracking-tight">
            {props.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
