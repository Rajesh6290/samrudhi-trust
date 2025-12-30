"use client";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Stat {
  _id: string;
  title: string;
  value: number;
  suffix: string;
  order: number;
  isActive: boolean;
}

const ImpactCounter = ({
  value,
  title,
  suffix = "",
}: {
  value: number;
  title: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds for smooth animation
      const steps = 60; // 60 steps for smoother updates
      const stepDuration = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        // Easing function for smooth deceleration (ease-out)
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
    <div
      ref={ref}
      className="text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-3xl md:text-4xl font-black text-orange-600 mb-1">
        {count.toLocaleString()}
        {suffix}
      </h3>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </p>
    </div>
  );
};

const RealTimeImpact = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats?active=true");
        const data = await res.json();
        setStats(data.stats || []);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section id="impact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 text-slate-900">
            Our Real-Time Impact
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Serving continuously since 2022
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-32 bg-slate-100 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p>No statistics available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <ImpactCounter
                key={stat._id}
                value={stat.value}
                title={stat.title}
                suffix={stat.suffix}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RealTimeImpact;
