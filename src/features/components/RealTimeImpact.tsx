"use client";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import useSwr from "../hooks/useSwr";

interface Stat {
  _id: string;
  title: string;
  ref: string;
  value: number;
  suffix: string;
  order: number;
  isActive: boolean;
}

const circleColors = [
  "bg-orange-500/20",
  "bg-blue-500/20",
  "bg-green-500/20",
  "bg-purple-500/20",
  "bg-pink-500/20",
  "bg-indigo-500/20",
  "bg-red-500/20",
  "bg-teal-500/20",
  "bg-amber-500/20",
  "bg-cyan-500/20",
  "bg-emerald-500/20",
  "bg-violet-500/20",
];

const ImpactCounter = ({
  value,
  title,
  description,
  suffix = "",
  index,
  colorIndex,
}: {
  value: number;
  title: string;
  description: string;
  suffix?: string;
  index: number;
  colorIndex: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const circleColor = circleColors[colorIndex % circleColors.length];

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newCount = Math.floor(easeOutQuart * value);

        setCount(newCount);

        if (currentStep >= steps) {
          setCount(value);
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      className="relative h-full group"
    >
      <div
        className={`relative p-8 h-full bg-linear-to-br from-white to-slate-50 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
      >
        {/* Animated corner accent - top right */}
        <motion.div
          className={`absolute -top-6 -right-6 w-32 h-32 ${circleColor} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10">
          {/* Counter */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
          >
            <h3
              className={`text-5xl md:text-6xl font-black bg-linear-to-br from-orange-600 to-orange-500 bg-clip-text text-transparent mb-3 tracking-tight`}
            >
              {count.toLocaleString()}
              {suffix && <span className="text-4xl">{suffix}</span>}
            </h3>
          </motion.div>

          {/* Title */}
          <motion.h4
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
            className="text-lg font-bold text-slate-800 mb-2 leading-tight"
          >
            {title}
          </motion.h4>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
            className="text-xs text-slate-600 leading-relaxed font-medium"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

const RealTimeImpact = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { data: statsData, isLoading: loading } = useSwr("stats?active=true");
  const stats: Stat[] = (statsData?.stats || []).sort(
    (a: Stat, b: Stat) => a.order - b.order
  );

  const [displayStats, setDisplayStats] = useState<Stat[]>([]);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use a layout effect to set initial state before paint
  useEffect(() => {
    if (stats.length === 0) return;

    // Clear any existing timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    // Only shuffle on initial load when displayStats is empty
    if (displayStats.length === 0) {
      const shuffled = [...stats].sort(() => Math.random() - 0.5);

      // Use requestAnimationFrame to schedule the state update
      requestAnimationFrame(() => {
        setDisplayStats(shuffled);

        // After animation, sort them back to proper order
        animationTimerRef.current = setTimeout(() => {
          setDisplayStats(stats);
        }, 1000);
      });
    } else {
      // Just update with new stats if already initialized
      setDisplayStats(stats);
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const statsToShow = displayStats.length > 0 ? displayStats : stats;

  return (
    <section
      id="impact"
      className="py-24 bg-linear-to-b from-slate-50 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-linear(circle_at_30%_50%,rgba(251,146,60,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-linear(circle_at_70%_80%,rgba(251,146,60,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={sectionRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-orange-500 rounded-full"
              />
              Live Impact
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-black mb-4 text-slate-900 leading-tight">
            Our Real-Time Impact
          </h2>
          <p className="text-slate-600 text-lg font-semibold max-w-2xl mx-auto">
            Serving communities continuously since 2022 with transparency and
            dedication
          </p>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="h-64 bg-linear-to-br from-slate-100 to-slate-50 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : stats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-slate-600 font-medium">
                No statistics available at the moment.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Check back soon for updates!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid h-fit grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {statsToShow.map((stat, index) => (
              <motion.div
                key={stat._id}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="h-full"
              >
                <ImpactCounter
                  value={stat.value}
                  title={stat.title}
                  description={stat.ref}
                  suffix={stat.suffix}
                  index={index}
                  colorIndex={stats.findIndex((s) => s._id === stat._id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 text-sm font-medium">
            Numbers updated in real-time • Last updated:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default RealTimeImpact;
