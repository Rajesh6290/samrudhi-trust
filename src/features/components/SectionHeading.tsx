"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SectionHeadingProps {
  tag?: string;
  title: string;
  subtitle?: string;
  highlightText?: string;
  className?: string;
  animate?: boolean;
  typing?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  tag,
  title,
  subtitle,
  highlightText,
  className = "",
  animate = true,
  typing = false,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!typing) return;

    if (currentIndex < title.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + title[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, title, typing]);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={animate ? "hidden" : "visible"}
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      variants={variants}
      className={`text-center ${className}`}
    >
      {tag && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-block text-orange-500 font-black uppercase tracking-[0.2em] text-sm mb-4"
        >
          {tag}
        </motion.span>
      )}
      <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
        {typing ? (
          <>
            {displayedText}
            <span className="animate-pulse">|</span>
          </>
        ) : (
          <>
            {title}
            {highlightText && (
              <>
                <br />
                <span className="text-orange-500">{highlightText}</span>
              </>
            )}
          </>
        )}
      </h2>
      {subtitle && (
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
