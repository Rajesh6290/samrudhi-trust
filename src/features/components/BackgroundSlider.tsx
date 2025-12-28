"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BackgroundSliderProps {
  images: string[];
  duration?: number;
  overlayOpacity?: string;
  effect?: "fade-zoom" | "slide" | "fade-scale" | "ken-burns";
}

const BackgroundSlider: React.FC<BackgroundSliderProps> = ({
  images,
  duration = 5000,
  overlayOpacity = "bg-slate-900/80",
  effect = "slide",
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % images.length),
      duration
    );
    return () => clearInterval(interval);
  }, [images.length, duration]);

  const variants = {
    "fade-zoom": {
      initial: { opacity: 0, scale: 1.1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    slide: {
      initial: { opacity: 0, x: "100%" },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: "-100%" },
    },
    "fade-scale": {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 },
    },
    "ken-burns": {
      initial: { opacity: 0, scale: 1 },
      animate: { opacity: 1, scale: 1.15 },
      exit: { opacity: 0 },
    },
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={variants[effect].initial}
          animate={variants[effect].animate}
          exit={variants[effect].exit}
          transition={{
            duration: 1.5,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[index]})` }}
        />
      </AnimatePresence>
      <div className={`absolute inset-0 ${overlayOpacity}`} />
    </div>
  );
};
export default BackgroundSlider;
