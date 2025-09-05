"use client";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRef, useState } from "react";

// Define a simple Button component to replace the import
const Button = ({ children }: { children: React.ReactNode }) => (
  <button className="bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-300 ease-in-out shadow-lg">
    {children}
  </button>
);

// Define image assets as self-contained data URIs to remove dependencies
const starBg = {
  src: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Ccircle cx='50' cy='50' r='0.5'/%3E%3Ccircle cx='10' cy='10' r='0.5'/%3E%3Ccircle cx='90' cy='90' r='0.5'/%3E%3Ccircle cx='10' cy='90' r='0.5'/%3E%3Ccircle cx='90' cy='10' r='0.5'/%3E%3Ccircle cx='30' cy='70' r='0.5'/%3E%3Ccircle cx='70' cy='30' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
  width: 100,
};

const gridLineBg = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 38h40v2H0v-2zM0 0h40v2H0V0zm19 0h2v40h-2V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
};

export const CallToAction = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(
    scrollYProgress,
    [0, 1],
    [-300, 300]
  );

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springMouseX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const springMouseY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  const maskImageStyle = useTransform(
    [springMouseX, springMouseY],
    (latest: number[]) => {
      const [x, y] = latest;
      return `radial-gradient(250px 250px at ${x.toFixed(2)}px ${y.toFixed(
        2
      )}px, black, transparent)`;
    }
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsHovering(true);
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(rect.width / 2);
    mouseY.set(rect.height / 2);
  };

  return (
    <section className="py-20 md:py-24" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <motion.div
          ref={containerRef}
          className="border border-white/15 py-24 rounded-xl overflow-hidden relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ backgroundPositionX: starBg.width }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          style={{
            backgroundPositionY,
            backgroundImage: `url("${starBg.src}")`,
          }}
        >
          <motion.div
            className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-white/5 backdrop-blur-xl"
            style={{
              x: springMouseX,
              y: springMouseY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              scale: isHovering && !isHoveringButton ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />

          <motion.div
            className="absolute inset-0 bg-[rgb(74,32,138)] bg-blend-overlay"
            style={{
              backgroundImage: `url("${gridLineBg.src}")`,
              maskImage: maskImageStyle,
              WebkitMaskImage: maskImageStyle,
            }}
          />

          <div className="relative">
            <h2 className="text-5xl md:text-6xl max-w-sm mx-auto tracking-tighter text-center font-medium">
              Resumex AI For EveryOne
            </h2>
            <p className="text-center text-lg md:text-xl max-w-sm mx-auto text-white/70 px-4 mt-5 tracking-tight">
              Achieve clear, impactful results without the complexity.
            </p>
            <div
              className="flex justify-center mt-5"
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
            >
              <Button>Get Started</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
