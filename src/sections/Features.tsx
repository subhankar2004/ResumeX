"use client";
import {
  DotLottieCommonPlayer,
  DotLottiePlayer,
} from "@dotlottie/react-player";
import Image from "next/image";
import productImage from "@/assets/product-image.png";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-react";
import { animate, useMotionTemplate, useMotionValue } from "framer-motion";
import { motion } from "framer-motion";

const tabs = [
  {
    icon: "/assets/lottie/vroom.lottie",
    title: "User-friendly dashboard",
    isNew: false,
    backgroundPositionX: 0,
    backgroundPositionY: 0,
    backgroundSizeX: 150,
  },
  {
    icon: "/assets/lottie/click.lottie",
    title: "One-click generation",
    isNew: false,
    backgroundPositionX: 98,
    backgroundPositionY: 100,
    backgroundSizeX: 135,
  },
  {
    icon: "/assets/lottie/stars.lottie",
    title: "Template library",
    isNew: true,
    backgroundPositionX: 100,
    backgroundPositionY: 27,
    backgroundSizeX: 177,
  },
];

const FeatureTab = (
  props: (typeof tabs)[number] &
    ComponentPropsWithoutRef<"div"> & { selected: boolean }
) => {
  const dotLottieRef = useRef<DotLottieCommonPlayer>(null);

  const xPercentage = useMotionValue(0);
  const yPercentage = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(60px 60px at ${xPercentage}% ${yPercentage}%, white, transparent)`;

  useEffect(() => {
    if (!props.selected) {
      // Stop animations if not selected
      xPercentage.stop();
      yPercentage.stop();
      return;
    }

    xPercentage.set(0);
    yPercentage.set(0);

    animate(xPercentage, [0, 100, 100, 0, 0], {
      duration: 4,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
    });

    animate(yPercentage, [0, 0, 100, 100, 0], {
      duration: 4,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
    });
  }, [props.selected, xPercentage, yPercentage]); // Add dependencies

  const handleHover = () => {
    if (dotLottieRef.current) {
      dotLottieRef.current.seek(0);
      dotLottieRef.current.play();
    }
  };

  return (
    <div
      onMouseEnter={handleHover}
      className="border border-white/15 flex p-2.5 rounded-xl gap-2.5 items-center lg:flex-1 relative"
      onClick={props.onClick}
    >
      {props.selected && (
        <motion.div
          style={{ maskImage }}
          className="absolute inset-0 border-2 border-[#A369FF] rounded-xl"
        />
      )}

      <div className="h-12 w-12 border border-white/15 rounded-lg inline-flex items-center justify-center">
        <DotLottiePlayer
          ref={dotLottieRef}
          src={props.icon}
          className="h-5 w-5"
          autoplay
        />
      </div>
      <div className="font-medium">{props.title}</div>
      {props.isNew && (
        <div className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
          New
        </div>
      )}
    </div>
  );
};

export const Features = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const backgroundPositionX = useMotionValue(tabs[0].backgroundPositionX);
  const backgroundPositionY = useMotionValue(tabs[0].backgroundPositionY);
  const backgroundSizeX = useMotionValue(tabs[0].backgroundSizeX);

  const backgroundPosition = useMotionTemplate`${backgroundPositionX}% ${backgroundPositionY}%`;
  const backgroundSize = useMotionTemplate`${backgroundSizeX}% auto`;

  const handleSelectTab = (index: number) => {
    setSelectedTab(index);

    animate(
      backgroundSizeX,
      [backgroundSizeX.get(), 100, tabs[index].backgroundSizeX],
      {
        duration: 2,
        ease: "easeInOut",
      }
    );

    animate(
      backgroundPositionX,
      [backgroundPositionX.get(), tabs[index].backgroundPositionX],
      {
        duration: 0.5,
        ease: "easeInOut",
      }
    );

    animate(
      backgroundPositionY,
      [backgroundPositionY.get(), tabs[index].backgroundPositionY],
      {
        duration: 0.5,
        ease: "easeInOut",
      }
    );
  };

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
          Elevate your Resume..
        </h2>
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Est atque
          nostrum, sapiente perferendis qui provident consectetur .
        </p>
        <div className="mt-10 flex flex-col lg:flex-row gap-3">
          {tabs.map((tab, index) => (
            <FeatureTab
              key={index}
              {...tab}
              onClick={() => handleSelectTab(index)}
              selected={index === selectedTab}
            />
          ))}
        </div>

        <div className="border border-white/20 p-2.5 rounded-xl mt-3">
          <motion.div
            className="aspect-video bg-cover border border-white/20 rounded-lg"
            style={{
              backgroundPosition,
              backgroundSize,
              backgroundImage: `url(${productImage.src})`,
            }}
          />
        </div>
      </div>
    </section>
  );
};
